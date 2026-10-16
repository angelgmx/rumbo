import type { Database, SqlValue } from "../ports";
import type { ChangeFeed } from "../changeFeed";
import { MIGRATIONS } from "./migrations";

/**
 * La base de datos de la app: tareas, hábitos, rutinas, objetivos… lo que no es conocimiento.
 * Cada escritura avisa a la UI por el mismo canal que el vault.
 */
export class AppDatabase {
  private constructor(
    private readonly db: Database,
    private readonly changes: ChangeFeed,
  ) {}

  /** Abre la base de datos y la sube a la última versión del esquema. */
  static async open(db: Database, changes: ChangeFeed): Promise<AppDatabase> {
    const app = new AppDatabase(db, changes);
    await app.migrate();
    return app;
  }

  select<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    return this.db.select<T>(sql, params);
  }

  /**
   * Escribe y avisa a la UI. `applied` corre solo si la escritura ha ido bien, antes del aviso:
   * así quien guarda una copia en memoria la pone al día justo a tiempo.
   */
  async write(
    sql: string,
    params: SqlValue[] = [],
    applied?: (lastInsertId?: number) => void,
  ): Promise<number | undefined> {
    const { lastInsertId } = await this.db.execute(sql, params);
    applied?.(lastInsertId);
    this.changes.notify();
    return lastInsertId;
  }

  /** Un ajuste interno de la base de datos, como qué se ha importado ya del vault. */
  async setting(key: string): Promise<string | undefined> {
    const sql = "SELECT valor FROM ajustes WHERE clave = ?";
    const rows = await this.select<{ valor: string }>(sql, [key]);
    return rows[0]?.valor;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.db.execute(
      "INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor",
      [key, value],
    );
  }

  private async migrate(): Promise<void> {
    const [row] = await this.db.select<{ user_version: number }>("PRAGMA user_version");
    for (let version = row?.user_version ?? 0; version < MIGRATIONS.length; version++) {
      for (const statement of MIGRATIONS[version]!) await this.db.execute(statement);
      await this.db.execute(`PRAGMA user_version = ${version + 1}`);
    }
  }
}
