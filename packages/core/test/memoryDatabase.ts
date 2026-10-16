import { DatabaseSync } from "node:sqlite";
import type { Database } from "../src/ports";

/** Una base de datos SQLite en memoria para los tests: la misma SQL que en la app. */
export function memoryDatabase(): Database {
  const db = new DatabaseSync(":memory:");
  return {
    execute: async (sql, params = []) => {
      db.prepare(sql).run(...params);
    },
    select: async <T>(sql: string, params: (string | number | null)[] = []) =>
      db.prepare(sql).all(...params) as T[],
  };
}
