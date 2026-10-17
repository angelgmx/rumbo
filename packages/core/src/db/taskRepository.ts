import type { IsoDate } from "../domain/dates";
import type { Priority, Task, TaskDraft, TaskStatus, TaskStep } from "../domain/tasks";
import type { SqlValue } from "../ports";
import type { AppDatabase } from "./appDatabase";
import { PRIORITY_FROM_ROW, PRIORITY_TO_ROW, withoutUndefined } from "./rows";

/** Una fila de `tareas`, tal como sale de SQLite. */
interface TaskRow {
  id: number;
  titulo: string;
  estado: string;
  notas: string;
  pasos: string;
  etiquetas: string;
  prioridad: string | null;
  programada: string | null;
  hora: string | null;
  vence: string | null;
  repeticion: string | null;
  duracion_min: number | null;
  minutos_trabajados: number;
  area: string | null;
  proyecto_id: number | null;
  hito_id: number | null;
  objetivo_id: number | null;
  modulo: string | null;
  ejercicio: string | null;
  habito: string | null;
  en_foco_el: string | null;
  creada: string;
  hecha_el: string | null;
}

const STATUS_TO_ROW: Record<TaskStatus, string> = {
  todo: "pendiente",
  doing: "en_curso",
  done: "hecha",
};

// Columna de la tabla para cada campo del borrador.
const COLUMNS = {
  text: "titulo",
  notes: "notas",
  steps: "pasos",
  tags: "etiquetas",
  priority: "prioridad",
  scheduled: "programada",
  time: "hora",
  due: "vence",
  recurrence: "repeticion",
  duration: "duracion_min",
  spent: "minutos_trabajados",
  area: "area",
  projectId: "proyecto_id",
  milestoneId: "hito_id",
  goalId: "objetivo_id",
  module: "modulo",
  exercise: "ejercicio",
  habit: "habito",
  focusOn: "en_foco_el",
} as const satisfies Record<keyof TaskDraft, string>;

/**
 * Las tareas en la base de datos, con una copia en memoria de las que no están archivadas.
 * La base de datos es la verdad; la copia solo cambia cuando una escritura ha ido bien, y como
 * solo escribe esta app, siempre cuadra. Así el resto lee las tareas al momento.
 */
export class TaskRepository {
  private readonly cache = new Map<number, Task>();

  private constructor(private readonly db: AppDatabase) {}

  static async open(db: AppDatabase): Promise<TaskRepository> {
    const repository = new TaskRepository(db);
    await repository.reload();
    return repository;
  }

  all(): Task[] {
    return [...this.cache.values()];
  }

  get(id: number): Task | undefined {
    return this.cache.get(id);
  }

  /** Crea la tarea en el estado dado; si nace hecha, `doneOn` es el día en que se hizo. */
  async insert(
    draft: TaskDraft,
    created: IsoDate,
    state: { status: TaskStatus; doneOn?: IsoDate } = { status: "todo" },
  ): Promise<Task | undefined> {
    const doneOn = state.status === "done" ? (state.doneOn ?? created) : undefined;
    const values = toRow(draft);
    const columns = [...Object.keys(values), "creada", "estado", "hecha_el"];
    const params = [...Object.values(values), created, STATUS_TO_ROW[state.status], doneOn ?? null];
    const sql = `INSERT INTO tareas (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
    let inserted: Task | undefined;
    await this.db.write(sql, params, (id) => {
      if (id === undefined) return;
      inserted = fromDraft(id, draft, created, state.status, doneOn);
      this.cache.set(id, inserted);
    });
    return inserted;
  }

  async update(id: number, changes: Partial<TaskDraft>): Promise<void> {
    const values = toRow(changes);
    if (!this.cache.has(id) || Object.keys(values).length === 0) return;
    const sets = Object.keys(values).map((column) => `${column} = ?`);
    await this.db.write(
      `UPDATE tareas SET ${sets.join(", ")} WHERE id = ?`,
      [...Object.values(values), id],
      () => this.patch(id, { ...changes, ...cleared(changes) }),
    );
  }

  /** Cambia el estado de la tarea; `doneOn` solo cuenta si queda hecha. */
  async setStatus(id: number, status: TaskStatus, doneOn: IsoDate | undefined): Promise<void> {
    if (!this.cache.has(id)) return;
    const when = status === "done" ? doneOn : undefined;
    await this.db.write(
      "UPDATE tareas SET estado = ?, hecha_el = ? WHERE id = ?",
      [STATUS_TO_ROW[status], when ?? null, id],
      () =>
        this.patch(id, { done: status === "done", inProgress: status === "doing", doneOn: when }),
    );
  }

  async remove(id: number): Promise<void> {
    await this.db.write("DELETE FROM tareas WHERE id = ?", [id], () => this.cache.delete(id));
  }

  /** Archiva estas tareas: dejan de salir en la app pero se quedan en la base de datos. */
  async archive(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const marks = ids.map(() => "?").join(", ");
    await this.db.write(`UPDATE tareas SET archivada = 1 WHERE id IN (${marks})`, ids, () => {
      for (const id of ids) this.cache.delete(id);
    });
  }

  /** Pone al día la copia partiendo de lo último que tenga: dos cambios seguidos no se pisan. */
  private patch(id: number, changes: Partial<Task>): void {
    const current = this.cache.get(id);
    if (current) this.cache.set(id, withoutUndefined({ ...current, ...changes }) as Task);
  }

  /** Vuelve a leer de la base de datos, para cuando algo la cambia por fuera del repositorio. */
  async reload(): Promise<void> {
    const rows = await this.db.select<TaskRow>("SELECT * FROM tareas WHERE archivada = 0");
    this.cache.clear();
    for (const row of rows) this.cache.set(row.id, fromRow(row));
  }
}

function toRow(draft: Partial<TaskDraft>): Record<string, SqlValue> {
  const row: Record<string, SqlValue> = {};
  for (const key of Object.keys(draft) as (keyof TaskDraft)[]) {
    if (!(key in COLUMNS)) continue;
    row[COLUMNS[key]] = toColumn(key, draft[key]);
  }
  return row;
}

function toColumn(key: keyof TaskDraft, value: TaskDraft[keyof TaskDraft]): SqlValue {
  if (key === "steps") return JSON.stringify(value ?? []);
  if (key === "tags") return JSON.stringify(value ?? []);
  if (key === "notes") return typeof value === "string" ? value : "";
  if (key === "spent") return typeof value === "number" ? value : 0;
  if (key === "priority") return value ? PRIORITY_TO_ROW[value as Priority] : null;
  if (key === "text" && typeof value === "string") return value.trim();
  return (value as SqlValue | undefined) ?? null;
}

function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    text: row.titulo,
    done: row.estado === "hecha",
    inProgress: row.estado === "en_curso",
    doneOn: row.hecha_el ?? undefined,
    scheduled: row.programada ?? undefined,
    time: row.hora ?? undefined,
    due: row.vence ?? undefined,
    recurrence: row.repeticion ?? undefined,
    priority: row.prioridad ? PRIORITY_FROM_ROW[row.prioridad] : undefined,
    tags: JSON.parse(row.etiquetas) as string[],
    area: row.area ?? undefined,
    projectId: row.proyecto_id ?? undefined,
    milestoneId: row.hito_id ?? undefined,
    goalId: row.objetivo_id ?? undefined,
    module: row.modulo ?? undefined,
    exercise: row.ejercicio ?? undefined,
    habit: row.habito ?? undefined,
    duration: row.duracion_min ?? undefined,
    spent: row.minutos_trabajados,
    focusOn: row.en_foco_el ?? undefined,
    steps: JSON.parse(row.pasos) as TaskStep[],
    notes: row.notas,
    created: row.creada,
  };
}

function fromDraft(
  id: number,
  draft: TaskDraft,
  created: IsoDate,
  status: TaskStatus,
  doneOn: IsoDate | undefined,
): Task {
  return {
    ...withoutUndefined(draft),
    id,
    text: draft.text.trim(),
    done: status === "done",
    inProgress: status === "doing",
    doneOn,
    tags: draft.tags ?? [],
    steps: draft.steps ?? [],
    notes: draft.notes ?? "",
    spent: draft.spent ?? 0,
    created,
  };
}

/** Lo que vale un campo que el cambio vacía: las listas y textos no se quedan sin valor. */
function cleared(changes: Partial<TaskDraft>): Partial<Task> {
  const empty: Partial<Task> = { tags: [], steps: [], notes: "", spent: 0 };
  return Object.fromEntries(
    Object.entries(changes)
      .filter(([key, value]) => value === undefined && key in empty)
      .map(([key]) => [key, empty[key as keyof Task]]),
  ) as Partial<Task>;
}
