import type { Database } from "@rumbo/core";
import { mkdir } from "@tauri-apps/plugin-fs";
import SqlDatabase from "@tauri-apps/plugin-sql";

// La base de datos vive dentro del vault, en `.rumbo/`: viaja con él en copias y sincronización
// y no se pierde al reinstalar la app (ver ADR-0014).
const FOLDER = ".rumbo";
const FILE = "rumbo.db";

const opened = new Map<string, Promise<Database>>();

/** El puerto Database de core sobre el plugin sql de Tauri. Una conexión por vault. */
export function openAppDatabase(vaultRoot: string): Promise<Database> {
  let database = opened.get(vaultRoot);
  if (!database) {
    database = connect(vaultRoot);
    opened.set(vaultRoot, database);
  }
  return database;
}

async function connect(vaultRoot: string): Promise<Database> {
  const folder = `${vaultRoot}/${FOLDER}`;
  await mkdir(folder, { recursive: true });
  const db = await SqlDatabase.load(`sqlite:${folder}/${FILE}`);
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
