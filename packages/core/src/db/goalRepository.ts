import type { IsoDate } from "../domain/dates";
import type { Goal, GoalMetric, GoalStatus, IfThen } from "../domain/goals";
import type { SqlValue } from "../ports";
import type { AppDatabase } from "./appDatabase";
import { invert, withoutUndefined } from "./rows";

interface GoalRow {
  id: number;
  titulo: string;
  area: string | null;
  por_que: string;
  horizonte: string | null;
  periodo: string | null;
  fecha_limite: string | null;
  estado: string;
  metrica: string | null;
  obstaculo: string;
  planes: string;
}

interface MetricRow {
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

export interface StoredGoal {
  id: number;
  goal: Goal;
  /** Las notas de las rutas que lo empujan. */
  roadmaps: string[];
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
      if (id !== undefined) this.cache.set(id, { id, goal, roadmaps: [] });
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

  async addRoadmap(id: number, roadmap: string): Promise<void> {
    const stored = this.cache.get(id);
    if (!stored || stored.roadmaps.includes(roadmap)) return;
    await this.db.write(
      "INSERT INTO objetivo_rutas (objetivo_id, ruta_nota) VALUES (?, ?)",
      [id, roadmap],
      () => this.cache.set(id, { ...stored, roadmaps: [...stored.roadmaps, roadmap] }),
    );
  }

  async removeRoadmap(id: number, roadmap: string): Promise<void> {
    const stored = this.cache.get(id);
    if (!stored) return;
    await this.db.write(
      "DELETE FROM objetivo_rutas WHERE objetivo_id = ? AND ruta_nota = ?",
      [id, roadmap],
      () =>
        this.cache.set(id, { ...stored, roadmaps: stored.roadmaps.filter((r) => r !== roadmap) }),
    );
  }

  private async reload(): Promise<void> {
    const rows = await this.db.select<GoalRow>("SELECT * FROM objetivos");
    const links = await this.db.select<{ objetivo_id: number; ruta_nota: string }>(
      "SELECT * FROM objetivo_rutas",
    );
    this.cache.clear();
    for (const row of rows) {
      const roadmaps = links.filter((link) => link.objetivo_id === row.id).map((l) => l.ruta_nota);
      this.cache.set(row.id, { id: row.id, goal: fromRow(row), roadmaps });
    }
  }
}

function toRow(goal: Goal): Record<string, SqlValue> {
  return {
    titulo: goal.title.trim(),
    area: goal.area ?? null,
    por_que: goal.why,
    horizonte: goal.horizon ? HORIZON_TO_ROW[goal.horizon] : null,
    periodo: goal.period ?? null,
    fecha_limite: goal.deadline ?? null,
    estado: STATUS_TO_ROW[goal.status],
    metrica: goal.metric ? JSON.stringify(metricToRow(goal.metric)) : null,
    obstaculo: goal.obstacle,
    planes: JSON.stringify(goal.plans.map((plan) => ({ si: plan.if, entonces: plan.then }))),
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
    deadline: row.fecha_limite ?? undefined,
    status: STATUS_FROM_ROW[row.estado] ?? "active",
    metric: row.metrica ? metricFromRow(JSON.parse(row.metrica)) : undefined,
    obstacle: row.obstaculo,
    plans: plans.map((plan): IfThen => ({ if: plan.si, then: plan.entonces })),
  });
}

function metricToRow(metric: GoalMetric): MetricRow {
  return withoutUndefined({
    nombre: metric.label,
    desde: metric.from,
    hasta: metric.target,
    unidad: metric.unit,
    actual: metric.current,
  });
}

function metricFromRow(row: MetricRow): GoalMetric {
  return withoutUndefined({
    label: row.nombre,
    from: row.desde,
    target: row.hasta,
    unit: row.unidad,
    current: row.actual,
  });
}
