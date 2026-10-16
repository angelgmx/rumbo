import type { TaskChanges } from "../domain/tasks";
import type { AppDatabase } from "./appDatabase";

export type OrganizationStatus = "aplicada" | "revertida" | "descartada";

export interface TaskOrganization {
  id: number;
  taskId: number;
  status: OrganizationStatus;
  before?: TaskChanges;
  after?: TaskChanges;
}

interface OrganizationRow {
  id: number;
  taskId: number;
  status: OrganizationStatus;
  before: string | null;
  after: string | null;
}

/** Lo que la IA ha hecho con las tareas sueltas y qué decidió el usuario: para deshacer y no insistir. */
export class TaskOrganizationRepository {
  constructor(private readonly db: AppDatabase) {}

  async get(id: number): Promise<TaskOrganization | undefined> {
    const rows = await this.db.select<OrganizationRow>(
      `SELECT id, tarea_id AS taskId, estado AS status, antes AS before, despues AS after
       FROM organizaciones_tarea WHERE id = ?`,
      [id],
    );
    return rows[0] && fromRow(rows[0]);
  }

  /** Las tareas que el usuario no quiere que se vuelvan a proponer: descartadas o deshechas. */
  async refusedTaskIds(): Promise<Set<number>> {
    const rows = await this.db.select<{ taskId: number }>(
      `SELECT DISTINCT tarea_id AS taskId FROM organizaciones_tarea
       WHERE estado IN ('revertida', 'descartada')`,
    );
    return new Set(rows.map((row) => row.taskId));
  }

  /** Apunta lo que se ha hecho con la tarea. Devuelve el id del apunte. */
  record(
    taskId: number,
    status: OrganizationStatus,
    created: string,
    changes?: { before: TaskChanges; after: TaskChanges },
  ): Promise<number | undefined> {
    return this.db.write(
      `INSERT INTO organizaciones_tarea (tarea_id, estado, antes, despues, creada)
       VALUES (?, ?, ?, ?, ?)`,
      [
        taskId,
        status,
        changes ? writeChanges(changes.before) : null,
        changes ? writeChanges(changes.after) : null,
        created,
      ],
    );
  }

  async markReverted(id: number): Promise<void> {
    await this.db.write("UPDATE organizaciones_tarea SET estado = 'revertida' WHERE id = ?", [id]);
  }
}

function fromRow(row: OrganizationRow): TaskOrganization {
  return {
    id: row.id,
    taskId: row.taskId,
    status: row.status,
    before: row.before ? readChanges(row.before) : undefined,
    after: row.after ? readChanges(row.after) : undefined,
  };
}

// Un campo vacío se guarda como null: así «antes» recuerda que no había nada y revertir lo quita.
function writeChanges(changes: TaskChanges): string {
  return JSON.stringify(changes, (_key, value: unknown) => (value === undefined ? null : value));
}

function readChanges(json: string): TaskChanges {
  const raw = JSON.parse(json) as Record<string, unknown>;
  return Object.fromEntries(Object.keys(raw).map((key) => [key, raw[key] ?? undefined]));
}
