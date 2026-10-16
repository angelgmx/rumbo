import type { Database } from "@rumbo/core";
import SqlDatabase from "@tauri-apps/plugin-sql";

// La base de datos de la app vive en su carpeta de datos, no en el vault (ver ADR-0013).
const DATABASE_URL = "sqlite:rumbo.db";

let opened: Promise<Database> | undefined;

/** El puerto Database de core sobre el plugin sql de Tauri. Una sola conexión para toda la app. */
export function openAppDatabase(): Promise<Database> {
  opened ??= connect();
  return opened;
}

async function connect(): Promise<Database> {
  const db = await SqlDatabase.load(DATABASE_URL);
  // Las claves ajenas están apagadas por defecto en SQLite; sin ellas no hay borrado en cascada.
  await db.execute("PRAGMA foreign_keys = ON");
  return {
    execute: async (sql, params = []) => {
      const { lastInsertId } = await db.execute(sql, params);
      return { lastInsertId };
    },
    select: (sql, params = []) => db.select(sql, params),
  };
}
