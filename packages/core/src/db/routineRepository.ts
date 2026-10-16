import type { IsoDate } from "../domain/dates";
import type { BlockKind, Routine, RoutineBlock } from "../domain/routines";
import type { AppDatabase } from "./appDatabase";
import { invert, scheduleFromRow, scheduleToRow } from "./rows";

/** Una fila de `rutinas`, tal como sale de SQLite. */
interface RoutineRow {
  id: number;
  nombre: string;
  tipo: string;
  dias: string;
  hora_inicio: string;
  area: string | null;
  activa: number;
  vigente_desde: string | null;
  vigente_hasta: string | null;
  objetivo_id: number | null;
  habito: string | null;
  bloques: string;
}

/** Un bloque dentro del JSON de `bloques`. */
interface BlockRow {
  tipo: string;
  minutos: number;
  titulo?: string;
  habito?: string;
  tema?: string;
  tarea?: string;
}

const KIND_TO_ROW: Record<Routine["kind"], string> = {
  morning: "manana",
  afternoon: "tarde",
  evening: "noche",
  study: "estudio",
  gym: "gym",
  custom: "libre",
};
const KIND_FROM_ROW = invert(KIND_TO_ROW);

const BLOCK_TO_ROW: Record<BlockKind, string> = {
  habit: "habito",
  module: "tema",
  task: "tarea",
  activity: "actividad",
  break: "descanso",
};
const BLOCK_FROM_ROW = invert(BLOCK_TO_ROW);

/**
 * Las rutinas, con una copia en memoria que solo cambia cuando la escritura ha ido bien.
 * Cada rutina es una fila con sus bloques dentro: cualquier cambio es una sola escritura.
 */
export class RoutineRepository {
  private readonly cache = new Map<number, Routine>();

  private constructor(private readonly db: AppDatabase) {}

  static async open(db: AppDatabase): Promise<RoutineRepository> {
    const repository = new RoutineRepository(db);
    await repository.reload();
    return repository;
  }

  all(): { id: number; routine: Routine }[] {
    return [...this.cache].map(([id, routine]) => ({ id, routine }));
  }

  get(id: number): Routine | undefined {
    return this.cache.get(id);
  }

  /** Guarda una rutina nueva y devuelve su id. */
  async insert(routine: Routine, created: IsoDate): Promise<number | undefined> {
    const values = { ...toRow(routine), creada: created };
    const columns = Object.keys(values);
    const sql = `INSERT INTO rutinas (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
    return this.db.write(sql, Object.values(values), (id) => {
      if (id !== undefined) this.cache.set(id, routine);
    });
  }

  async save(id: number, routine: Routine): Promise<void> {
    if (!this.cache.has(id)) return;
    const values = toRow(routine);
    const sets = Object.keys(values).map((column) => `${column} = ?`);
    await this.db.write(
      `UPDATE rutinas SET ${sets.join(", ")} WHERE id = ?`,
      [...Object.values(values), id],
      () => this.cache.set(id, routine),
    );
  }

  async remove(id: number): Promise<void> {
    await this.db.write("DELETE FROM rutinas WHERE id = ?", [id], () => this.cache.delete(id));
  }

  private async reload(): Promise<void> {
    const rows = await this.db.select<RoutineRow>("SELECT * FROM rutinas");
    this.cache.clear();
    for (const row of rows) this.cache.set(row.id, fromRow(row));
  }
}

function toRow(routine: Routine) {
  return {
    nombre: (routine.title ?? "").trim(),
    tipo: KIND_TO_ROW[routine.kind],
    dias: JSON.stringify(scheduleToRow(routine.days)),
    hora_inicio: routine.start,
    area: routine.area ?? null,
    activa: routine.active ? 1 : 0,
    vigente_desde: routine.from ?? null,
    vigente_hasta: routine.until ?? null,
    objetivo_id: routine.goalId ?? null,
    habito: routine.habit ?? null,
    bloques: JSON.stringify(routine.blocks.map(blockToRow)),
  };
}

function fromRow(row: RoutineRow): Routine {
  return {
    title: row.nombre,
    kind: KIND_FROM_ROW[row.tipo] ?? "custom",
    days: scheduleFromRow(JSON.parse(row.dias)),
    start: row.hora_inicio,
    area: row.area ?? undefined,
    active: row.activa === 1,
    from: row.vigente_desde ?? undefined,
    until: row.vigente_hasta ?? undefined,
    goalId: row.objetivo_id ?? undefined,
    habit: row.habito ?? undefined,
    blocks: (JSON.parse(row.bloques) as BlockRow[]).map(blockFromRow),
  };
}

// El `ref` de un bloque es la clave del hábito, el enlace al tema o el id de la tarea; cada uno va en su campo.
function blockToRow(block: RoutineBlock): BlockRow {
  const row: BlockRow = { tipo: BLOCK_TO_ROW[block.kind], minutos: block.minutes };
  if (block.title) row.titulo = block.title;
  if (block.ref && block.kind === "habit") row.habito = block.ref;
  if (block.ref && block.kind === "module") row.tema = block.ref;
  if (block.ref && block.kind === "task") row.tarea = block.ref;
  return row;
}

function blockFromRow(row: BlockRow): RoutineBlock {
  const block: RoutineBlock = {
    kind: BLOCK_FROM_ROW[row.tipo] ?? "activity",
    minutes: row.minutos,
  };
  const ref = row.habito ?? row.tema ?? row.tarea;
  if (ref) block.ref = ref;
  if (row.titulo) block.title = row.titulo;
  return block;
}
