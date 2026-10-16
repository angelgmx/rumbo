import type { IsoDate } from "../domain/dates";
import type { Habit, HabitHistory, HabitKind, HabitValue } from "../domain/habits";
import type { SqlValue } from "../ports";
import type { AppDatabase } from "./appDatabase";
import { invert, scheduleFromRow, scheduleToRow, withoutUndefined } from "./rows";

/** Una fila de `habitos`, tal como sale de SQLite. */
interface HabitRow {
  id: number;
  clave: string;
  nombre: string;
  tipo: string;
  meta: number | null;
  minimo: number | null;
  unidad: string | null;
  frecuencia: string;
  area: string | null;
  objetivo_id: number | null;
  icono: string | null;
  color: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  empezado: string | null;
  hasta: string | null;
  archivado: number;
}

interface RecordRow {
  habito_id: number;
  dia: string;
  valor: number;
}

const KIND_TO_ROW: Record<HabitKind, string> = {
  check: "si_no",
  count: "cantidad",
  duration: "duracion",
  tasks: "tareas",
};
const KIND_FROM_ROW = invert(KIND_TO_ROW);

interface Stored {
  id: number;
  habit: Habit;
  /** Lo apuntado cada día, como número: en los de sí o no, 1. */
  records: Map<IsoDate, number>;
}

/**
 * Los hábitos y lo que hiciste de ellos cada día, con una copia en memoria que solo cambia
 * cuando la escritura ha ido bien. Como en las tareas, el resto lee al momento.
 */
export class HabitRepository {
  private readonly byKey = new Map<string, Stored>();

  private constructor(private readonly db: AppDatabase) {}

  static async open(db: AppDatabase): Promise<HabitRepository> {
    const repository = new HabitRepository(db);
    await repository.reload();
    return repository;
  }

  /** Todos, también los archivados. */
  all(): Habit[] {
    return [...this.byKey.values()].map(({ habit }) => habit);
  }

  get(key: string | undefined): Habit | undefined {
    return key === undefined ? undefined : this.byKey.get(key)?.habit;
  }

  /** Lo apuntado cada día, en el tipo del hábito: sí o no, o la cantidad. */
  history(key: string): HabitHistory {
    const stored = this.byKey.get(key);
    const history: HabitHistory = new Map();
    if (!stored) return history;
    for (const [day, value] of stored.records) {
      history.set(day, stored.habit.kind === "check" ? true : value);
    }
    return history;
  }

  async insert(habit: Habit, created: IsoDate): Promise<void> {
    const values = { clave: habit.key, ...toRow(habit), creado: created };
    const columns = Object.keys(values);
    const sql = `INSERT INTO habitos (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
    await this.db.write(sql, Object.values(values), (id) => {
      if (id !== undefined) this.byKey.set(habit.key, { id, habit, records: new Map() });
    });
  }

  /** Guarda todos los campos del hábito menos la clave, que no cambia nunca. */
  async save(habit: Habit): Promise<void> {
    const stored = this.byKey.get(habit.key);
    if (!stored) return;
    const values = toRow(habit);
    const sets = Object.keys(values).map((column) => `${column} = ?`);
    await this.db.write(
      `UPDATE habitos SET ${sets.join(", ")} WHERE id = ?`,
      [...Object.values(values), stored.id],
      () => this.byKey.set(habit.key, { ...stored, habit }),
    );
  }

  /** Borra el hábito y, con él, todo lo apuntado. */
  async remove(key: string): Promise<void> {
    const stored = this.byKey.get(key);
    if (!stored) return;
    await this.db.write("DELETE FROM habitos WHERE id = ?", [stored.id], () =>
      this.byKey.delete(key),
    );
  }

  /** Apunta lo de un día. No haber hecho nada (no o 0) no se guarda: borra lo que hubiera. */
  async record(key: string, day: IsoDate, value: HabitValue): Promise<void> {
    const stored = this.byKey.get(key);
    if (!stored) return;
    const amount = value === true ? 1 : value === false ? 0 : value;
    if (amount <= 0) {
      await this.db.write(
        "DELETE FROM registros_habito WHERE habito_id = ? AND dia = ?",
        [stored.id, day],
        () => stored.records.delete(day),
      );
      return;
    }
    await this.db.write(
      `INSERT INTO registros_habito (habito_id, dia, valor) VALUES (?, ?, ?)
       ON CONFLICT (habito_id, dia) DO UPDATE SET valor = excluded.valor`,
      [stored.id, day, amount],
      () => stored.records.set(day, amount),
    );
  }

  /** Vuelve a leer de la base de datos, para cuando algo la cambia por fuera del repositorio. */
  async reload(): Promise<void> {
    const rows = await this.db.select<HabitRow>("SELECT * FROM habitos");
    const records = await this.db.select<RecordRow>("SELECT * FROM registros_habito");
    const byId = new Map<number, Stored>();
    this.byKey.clear();
    for (const row of rows) {
      const stored = { id: row.id, habit: fromRow(row), records: new Map<IsoDate, number>() };
      byId.set(row.id, stored);
      this.byKey.set(row.clave, stored);
    }
    for (const { habito_id, dia, valor } of records) byId.get(habito_id)?.records.set(dia, valor);
  }
}

function toRow(habit: Habit): Record<string, SqlValue> {
  return {
    nombre: habit.name.trim(),
    tipo: KIND_TO_ROW[habit.kind],
    meta: habit.target ?? null,
    minimo: habit.minimum ?? null,
    unidad: habit.unit ?? null,
    frecuencia: JSON.stringify(scheduleToRow(habit.schedule)),
    area: habit.area ?? null,
    objetivo_id: habit.goalId ?? null,
    icono: habit.icon ?? null,
    color: habit.color ?? null,
    hora_inicio: habit.start ?? null,
    hora_fin: habit.end ?? null,
    empezado: habit.started ?? null,
    hasta: habit.until ?? null,
    archivado: habit.archived ? 1 : 0,
  };
}

function fromRow(row: HabitRow): Habit {
  return withoutUndefined<Habit>({
    key: row.clave,
    name: row.nombre,
    kind: KIND_FROM_ROW[row.tipo] ?? "check",
    target: row.meta ?? undefined,
    minimum: row.minimo ?? undefined,
    unit: row.unidad ?? undefined,
    schedule: scheduleFromRow(JSON.parse(row.frecuencia)),
    area: row.area ?? undefined,
    goalId: row.objetivo_id ?? undefined,
    icon: row.icono ?? undefined,
    color: row.color ?? undefined,
    start: row.hora_inicio ?? undefined,
    end: row.hora_fin ?? undefined,
    started: row.empezado ?? undefined,
    until: row.hasta ?? undefined,
    archived: row.archivado === 1,
  });
}
