import { describe, expect, it } from "vitest";
import { ChangeFeed } from "../src/changeFeed";
import { AppDatabase } from "../src/db/appDatabase";
import { MIGRATIONS } from "../src/db/migrations";
import { memoryDatabase } from "./memoryDatabase";

async function databaseAt(version: number) {
  const database = memoryDatabase();
  for (const statements of MIGRATIONS.slice(0, version)) {
    for (const statement of statements) await database.execute(statement);
  }
  await database.execute(`PRAGMA user_version = ${version}`);
  return database;
}

describe("migrations", () => {
  it("turns saved free and task blocks into activities", async () => {
    const database = await databaseAt(MIGRATIONS.length - 1);
    const blocks = [
      { tipo: "habito", habito: "ingles", minutos: 15 },
      { tipo: "libre", titulo: "Café", minutos: 10 },
      { tipo: "tema", tema: "[[Java desde cero]]", minutos: 45 },
      { tipo: "tarea", titulo: "Repaso", minutos: 15 },
      { tipo: "descanso", minutos: 5 },
    ];
    const insert = "INSERT INTO rutinas (nombre, hora_inicio, bloques, creada) VALUES (?, ?, ?, ?)";
    await database.execute(insert, ["Tarde", "18:00", JSON.stringify(blocks), "2026-10-01"]);
    await database.execute(insert, ["Vacía", "07:00", "[]", "2026-10-01"]);

    await AppDatabase.open(database, new ChangeFeed());

    const rows = await database.select<{ nombre: string; bloques: string }>(
      "SELECT nombre, bloques FROM rutinas ORDER BY id",
    );
    expect(JSON.parse(rows[0]!.bloques)).toEqual([
      { tipo: "habito", habito: "ingles", minutos: 15 },
      { tipo: "actividad", titulo: "Café", minutos: 10 },
      { tipo: "tema", tema: "[[Java desde cero]]", minutos: 45 },
      { tipo: "actividad", titulo: "Repaso", minutos: 15 },
      { tipo: "descanso", minutos: 5 },
    ]);
    expect(rows[1]!.bloques).toBe("[]");
  });
});
