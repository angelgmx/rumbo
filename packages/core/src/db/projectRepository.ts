import type { IsoDate } from "../domain/dates";
import type { Milestone, Project, ProjectLink, ProjectStatus } from "../domain/projects";
import type { SqlValue } from "../ports";
import type { AppDatabase } from "./appDatabase";
import { invert, withoutUndefined } from "./rows";

interface ProjectRow {
  id: number;
  titulo: string;
  resultado: string;
  area: string | null;
  objetivo_id: number | null;
  estado: string;
  inicio: string | null;
  fecha_limite: string | null;
  terminado: string | null;
  enlaces: string;
  hitos: string;
  archivado: number;
}

const STATUS_TO_ROW: Record<ProjectStatus, string> = {
  idea: "idea",
  active: "en_marcha",
  blocked: "bloqueado",
  done: "hecho",
};
const STATUS_FROM_ROW = invert(STATUS_TO_ROW);

/** Los proyectos, con sus hitos y enlaces dentro, y una copia en memoria como el resto. */
export class ProjectRepository {
  private readonly cache = new Map<number, Project>();

  private constructor(private readonly db: AppDatabase) {}

  static async open(db: AppDatabase): Promise<ProjectRepository> {
    const repository = new ProjectRepository(db);
    await repository.reload();
    return repository;
  }

  all(): { id: number; project: Project }[] {
    return [...this.cache].map(([id, project]) => ({ id, project }));
  }

  get(id: number | undefined): Project | undefined {
    return id === undefined ? undefined : this.cache.get(id);
  }

  async insert(project: Project, created: IsoDate): Promise<number | undefined> {
    const values = { ...toRow(project), creado: created };
    const columns = Object.keys(values);
    const sql = `INSERT INTO proyectos (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
    return this.db.write(sql, Object.values(values), (id) => {
      if (id !== undefined) this.cache.set(id, project);
    });
  }

  async save(id: number, project: Project): Promise<void> {
    if (!this.cache.has(id)) return;
    const values = toRow(project);
    const sets = Object.keys(values).map((column) => `${column} = ?`);
    await this.db.write(
      `UPDATE proyectos SET ${sets.join(", ")} WHERE id = ?`,
      [...Object.values(values), id],
      () => this.cache.set(id, project),
    );
  }

  /** Borra el proyecto. Sus tareas se quedan, sin proyecto. */
  async remove(id: number): Promise<void> {
    await this.db.write("DELETE FROM proyectos WHERE id = ?", [id], () => this.cache.delete(id));
  }

  private async reload(): Promise<void> {
    const rows = await this.db.select<ProjectRow>("SELECT * FROM proyectos");
    this.cache.clear();
    for (const row of rows) this.cache.set(row.id, fromRow(row));
  }
}

function toRow(project: Project): Record<string, SqlValue> {
  return {
    titulo: project.title.trim(),
    resultado: project.outcome.trim(),
    area: project.area ?? null,
    objetivo_id: project.goalId ?? null,
    estado: STATUS_TO_ROW[project.status],
    inicio: project.start ?? null,
    fecha_limite: project.deadline ?? null,
    terminado: project.finished ?? null,
    enlaces: JSON.stringify(project.links.map((link) => ({ titulo: link.title, url: link.url }))),
    hitos: JSON.stringify(
      project.milestones.map((milestone) => ({
        titulo: milestone.title,
        ...(milestone.date && { fecha: milestone.date }),
        hecho: milestone.done,
      })),
    ),
    archivado: project.archived ? 1 : 0,
  };
}

function fromRow(row: ProjectRow): Project {
  const links = JSON.parse(row.enlaces) as { titulo: string; url: string }[];
  const milestones = JSON.parse(row.hitos) as { titulo: string; fecha?: string; hecho: boolean }[];
  return withoutUndefined<Project>({
    title: row.titulo,
    outcome: row.resultado,
    area: row.area ?? undefined,
    goalId: row.objetivo_id ?? undefined,
    status: STATUS_FROM_ROW[row.estado] ?? "idea",
    start: row.inicio ?? undefined,
    deadline: row.fecha_limite ?? undefined,
    finished: row.terminado ?? undefined,
    links: links.map((link): ProjectLink => ({ title: link.titulo, url: link.url })),
    milestones: milestones.map((milestone): Milestone => ({
      title: milestone.titulo,
      ...(milestone.fecha && { date: milestone.fecha }),
      done: milestone.hecho,
    })),
    archived: row.archivado === 1,
  });
}
