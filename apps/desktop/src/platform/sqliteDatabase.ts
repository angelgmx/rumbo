import type { Database } from "@rumbo/core";
import SqlDatabase from "@tauri-apps/plugin-sql";

// La base de datos de la app vive en su carpeta de datos, no en el vault (ver ADR-0013).
const DATABASE_URL = "sqlite:rumbo.db";

/** El puerto Database de core sobre el plugin sql de Tauri. */
export async function openAppDatabase(): Promise<Database> {
  const db = await SqlDatabase.load(DATABASE_URL);
  // Las claves ajenas están apagadas por defecto en SQLite; sin ellas no hay borrado en cascada.
  await db.execute("PRAGMA foreign_keys = ON");
  return {
    execute: async (sql, params = []) => {
      await db.execute(sql, params);
    },
    select: (sql, params = []) => db.select(sql, params),
  };
}
