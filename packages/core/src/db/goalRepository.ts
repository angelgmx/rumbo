import type { IsoDate } from "../domain/dates";
import type { Goal, GoalStatus, IfThen, KeyResult } from "../domain/goals";
import type { Resource, ResourceKind } from "../domain/resources";
import type { SqlValue } from "../ports";
import type { AppDatabase } from "./appDatabase";
import { invert, PRIORITY_FROM_ROW, PRIORITY_TO_ROW, withoutUndefined } from "./rows";

interface GoalRow {
  id: number;
  titulo: string;
  area: string | null;
  por_que: string;
  horizonte: string | null;
  periodo: string | null;
  inicio: string | null;
  fecha_limite: string | null;
  estado: string;
  prioridad: string | null;
  resultados_clave: string;
  obstaculo: string;
  planes: string;
  recursos: string;
}

interface KeyResultRow {
  nombre: string;
  desde: number;
  hasta: number;
  unidad?: string;
  actual?: number;
}

const STATUS_TO_ROW: Record<GoalStatus, string> = {
  "not-started": "sin_empezar",
  active: "activo",
  paused: "pausado",
  done: "hecho",
  dropped: "abandonado",
  failed: "fallido",
};
const STATUS_FROM_ROW = invert(STATUS_TO_ROW);

const HORIZON_TO_ROW = { year: "anio", quarter: "trimestre" } as const;
const HORIZON_FROM_ROW = invert(HORIZON_TO_ROW);

const RESOURCE_TO_ROW: Record<ResourceKind, string> = {
  course: "curso",
  video: "video",
  docs: "docs",
  repo: "repo",
  article: "articulo",
  book: "libro",
  certification: "certificado",
};
const RESOURCE_FROM_ROW = invert(RESOURCE_TO_ROW);

/** Una nota del vault enlazada a un objetivo: una ruta que lo empuja o una nota que lo acompaña. */
export type GoalNoteKind = "roadmap" | "note";
const NOTE_KIND_TO_ROW: Record<GoalNoteKind, string> = { roadmap: "ruta", note: "nota" };

export interface StoredGoal {
  id: number;
  goal: Goal;
  /** Las notas de las rutas que lo empujan. */
  roadmaps: string[];
  /** Otras notas del vault que lo acompañan (investigación, ideas…). */
  notes: string[];
}

/** Los objetivos y las rutas que los empujan, con una copia en memoria como el resto. */
export class GoalRepository {
  private readonly cache = new Map<number, StoredGoal>();

  private constructor(private readonly db: AppDatabase) {}

  static async open(db: AppDatabase): Promise<GoalRepository> {
    const repository = new GoalRepository(db);
    await repository.reload();
    return repository;
  }

  all(): StoredGoal[] {
    return [...this.cache.values()];
  }

  get(id: number | undefined): StoredGoal | undefined {
    return id === undefined ? undefined : this.cache.get(id);
  }

  async insert(goal: Goal, created: IsoDate): Promise<number | undefined> {
    const values = { ...toRow(goal), creado: created };
    const columns = Object.keys(values);
    const sql = `INSERT INTO objetivos (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
    return this.db.write(sql, Object.values(values), (id) => {
      if (id !== undefined) this.cache.set(id, { id, goal, roadmaps: [], notes: [] });
    });
  }

  async save(id: number, goal: Goal): Promise<void> {
    const stored = this.cache.get(id);
    if (!stored) return;
    const values = toRow(goal);
    const sets = Object.keys(values).map((column) => `${column} = ?`);
    await this.db.write(
      `UPDATE objetivos SET ${sets.join(", ")} WHERE id = ?`,
      [...Object.values(values), id],
      () => this.cache.set(id, { ...stored, goal }),
    );
  }

  /** Borra el objetivo. Sus proyectos y hábitos se quedan, sin objetivo. */
  async remove(id: number): Promise<void> {
    await this.db.write("DELETE FROM objetivos WHERE id = ?", [id], () => this.cache.delete(id));
  }

  /** Enlaza una nota del vault: una ruta que lo empuja o una nota que lo acompaña. */
  async link(id: number, note: string, kind: GoalNoteKind): Promise<void> {
    const stored = this.cache.get(id);
    if (!stored || stored.roadmaps.includes(note) || stored.notes.includes(note)) return;
    await this.db.write(
      "INSERT INTO objetivo_notas (objetivo_id, nota, tipo) VALUES (?, ?, ?)",
      [id, note, NOTE_KIND_TO_ROW[kind]],
      () => this.cache.set(id, withNote(stored, note, kind)),
    );
  }

  async unlink(id: number, note: string): Promise<void> {
    const stored = this.cache.get(id);
    if (!stored) return;
    await this.db.write(
      "DELETE FROM objetivo_notas WHERE objetivo_id = ? AND nota = ?",
      [id, note],
      () =>
        this.cache.set(id, {
          ...stored,
          roadmaps: stored.roadmaps.filter((name) => name !== note),
          notes: stored.notes.filter((name) => name !== note),
        }),
    );
  }

  private async reload(): Promise<void> {
    const rows = await this.db.select<GoalRow>("SELECT * FROM objetivos");
    const links = await this.db.select<{ objetivo_id: number; nota: string; tipo: string }>(
      "SELECT * FROM objetivo_notas",
    );
    this.cache.clear();
    for (const row of rows) {
      const own = links.filter((link) => link.objetivo_id === row.id);
      this.cache.set(row.id, {
        id: row.id,
        goal: fromRow(row),
        roadmaps: own.filter((link) => link.tipo === "ruta").map((link) => link.nota),
        notes: own.filter((link) => link.tipo === "nota").map((link) => link.nota),
      });
    }
  }
}

function withNote(stored: StoredGoal, note: string, kind: GoalNoteKind): StoredGoal {
  return kind === "roadmap"
    ? { ...stored, roadmaps: [...stored.roadmaps, note] }
    : { ...stored, notes: [...stored.notes, note] };
}

function toRow(goal: Goal): Record<string, SqlValue> {
  return {
    titulo: goal.title.trim(),
    area: goal.area ?? null,
    por_que: goal.why,
    horizonte: goal.horizon ? HORIZON_TO_ROW[goal.horizon] : null,
    periodo: goal.period ?? null,
    inicio: goal.start ?? null,
    fecha_limite: goal.deadline ?? null,
    estado: STATUS_TO_ROW[goal.status],
    prioridad: goal.priority ? PRIORITY_TO_ROW[goal.priority] : null,
    resultados_clave: JSON.stringify(goal.keyResults.map(keyResultToRow)),
    obstaculo: goal.obstacle,
    planes: JSON.stringify(goal.plans.map((plan) => ({ si: plan.if, entonces: plan.then }))),
    recursos: JSON.stringify(goal.resources.map(resourceToRow)),
  };
}

function fromRow(row: GoalRow): Goal {
  const plans = JSON.parse(row.planes) as { si: string; entonces: string }[];
  return withoutUndefined({
    title: row.titulo,
    area: row.area ?? undefined,
    why: row.por_que,
    horizon: row.horizonte ? HORIZON_FROM_ROW[row.horizonte] : undefined,
    period: row.periodo ?? undefined,
    start: row.inicio ?? undefined,
    deadline: row.fecha_limite ?? undefined,
    status: STATUS_FROM_ROW[row.estado] ?? "active",
    priority: row.prioridad ? PRIORITY_FROM_ROW[row.prioridad] : undefined,
    keyResults: (JSON.parse(row.resultados_clave) as KeyResultRow[]).map(keyResultFromRow),
    obstacle: row.obstaculo,
    plans: plans.map((plan): IfThen => ({ if: plan.si, then: plan.entonces })),
    resources: (JSON.parse(row.recursos) as ResourceRow[]).map(resourceFromRow),
  });
}

function keyResultToRow(keyResult: KeyResult): KeyResultRow {
  return withoutUndefined({
    nombre: keyResult.title,
    desde: keyResult.from,
    hasta: keyResult.target,
    unidad: keyResult.unit,
    actual: keyResult.current,
  });
}

function keyResultFromRow(row: KeyResultRow): KeyResult {
  return withoutUndefined({
    title: row.nombre,
    from: row.desde,
    target: row.hasta,
    unit: row.unidad,
    current: row.actual,
  });
}

interface ResourceRow {
  titulo: string;
  url?: string;
  tipo: string;
  fuente?: string;
}

function resourceToRow(resource: Resource): ResourceRow {
  return withoutUndefined({
    titulo: resource.title,
    url: resource.url,
    tipo: RESOURCE_TO_ROW[resource.kind],
    fuente: resource.source,
  });
}

function resourceFromRow(row: ResourceRow): Resource {
  return withoutUndefined({
    title: row.titulo,
    url: row.url,
    kind: RESOURCE_FROM_ROW[row.tipo] ?? "article",
    source: row.fuente,
    status: "pending" as const,
  });
}
