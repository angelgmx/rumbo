import { describe, expect, it } from "vitest";
import { ChangeFeed } from "../src/changeFeed";
import { AppDatabase } from "../src/db/appDatabase";
import { MIGRATIONS } from "../src/db/migrations";
import { memoryDatabase } from "./memoryDatabase";

/** La versión justo antes de la migración que contiene `fragment`: así el test no depende de su posición. */
function versionBefore(fragment: string): number {
  return MIGRATIONS.findIndex((statements) => statements.some((sql) => sql.includes(fragment)));
}

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
    const database = await databaseAt(versionBefore("UPDATE rutinas SET bloques"));
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

  it("gives saved goals an empty priority", async () => {
    const database = await databaseAt(versionBefore("ALTER TABLE objetivos ADD COLUMN prioridad"));
    await database.execute("INSERT INTO objetivos (titulo, creado) VALUES (?, ?)", [
      "Inglés",
      "2026-10-01",
    ]);

    await AppDatabase.open(database, new ChangeFeed());

    const rows = await database.select<{ prioridad: string | null }>(
      "SELECT prioridad FROM objetivos",
    );
    expect(rows).toEqual([{ prioridad: null }]);
  });

  it("gives saved milestones an id and saved links a type", async () => {
    const database = await databaseAt(versionBefore("UPDATE proyectos SET hitos"));
    const milestones = [
      { titulo: "Landing", fecha: "2026-10-10", hecho: true },
      { titulo: "Demo", hecho: false },
    ];
    const links = [
      { titulo: "Código", url: "https://github.com/angel/citalash" },
      { titulo: "Web", url: "https://citalash.app" },
    ];
    const insert = "INSERT INTO proyectos (titulo, hitos, enlaces, creado) VALUES (?, ?, ?, ?)";
    await database.execute(insert, [
      "Citalash",
      JSON.stringify(milestones),
      JSON.stringify(links),
      "2026-10-01",
    ]);
    await database.execute(insert, ["Vacío", "[]", "[]", "2026-10-01"]);

    await AppDatabase.open(database, new ChangeFeed());

    const rows = await database.select<{
      hitos: string;
      enlaces: string;
      prioridad: string | null;
    }>("SELECT hitos, enlaces, prioridad FROM proyectos ORDER BY id");
    expect(JSON.parse(rows[0]!.hitos)).toEqual([
      { id: 1, titulo: "Landing", fecha: "2026-10-10", hecho: true },
      { id: 2, titulo: "Demo", hecho: false },
    ]);
    expect(JSON.parse(rows[0]!.enlaces)).toEqual([
      { tipo: "repo", titulo: "Código", url: "https://github.com/angel/citalash" },
      { tipo: "web", titulo: "Web", url: "https://citalash.app" },
    ]);
    expect([rows[1]!.hitos, rows[1]!.enlaces, rows[0]!.prioridad]).toEqual(["[]", "[]", null]);
  });
});
