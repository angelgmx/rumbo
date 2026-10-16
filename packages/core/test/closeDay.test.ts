import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type Rumbo } from "../src";
import { setWins, winsOf } from "../src/domain/closeDay";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";

describe("winsOf", () => {
  it("says what was done today, with the streak when there is one", () => {
    expect(
      winsOf({
        tasksDone: 2,
        habitsDone: [
          { name: "Running", streak: 5 },
          { name: "Reading", streak: 1 },
        ],
      }),
    ).toEqual(["Terminaste 2 tareas.", "Running hecho: llevas 5 días seguidos.", "Reading hecho."]);
  });

  it("says nothing without data", () => {
    expect(winsOf({ tasksDone: 0, habitsDone: [] })).toEqual([]);
  });
});

describe("setWins", () => {
  it("adds the section at the end", () => {
    expect(setWins("## Notas del día\n", ["Una."])).toBe(
      "## Notas del día\n\n## Lo que salió bien\n- Una.\n",
    );
  });

  it("replaces the section and leaves the next one alone", () => {
    const source = "## Lo que salió bien\n- Vieja.\n- Otra.\n\n## Notas del día\nTexto\n";
    expect(setWins(source, ["Nueva."])).toBe(
      "## Lo que salió bien\n- Nueva.\n\n## Notas del día\nTexto\n",
    );
  });
});

describe("CloseDayService", () => {
  let files: Map<string, string>;
  let rumbo: Rumbo;

  beforeEach(async () => {
    files = await loadDemoVault();
    // Domingo: mañana es lunes y toca la rutina de las 18:00.
    rumbo = await createRumbo({
      fs: memoryFileSystem(files),
      database: memoryDatabase(),
      clock: {
        now: () => new Date("2026-10-18T21:00"),
      },
    });
  });

  it("offers tomorrow's routine start times", () => {
    expect(rumbo.closeDay.tomorrowStarts()).toEqual(["18:00"]);
  });

  it("saves energy and wins today, and tomorrow's first step as an agenda block", async () => {
    await rumbo.closeDay.close({
      energy: "medium",
      wins: ["Terminaste 1 tarea."],
      tomorrow: { start: "18:00", firstStep: " Abre Variables y lee 1 minuto " },
    });

    const today = files.get("Journal/2026/10/2026-10-18.md")!;
    expect(today).toContain("energy: medium");
    expect(today).toContain("## Lo que salió bien\n- Terminaste 1 tarea.");
    expect(rumbo.closeDay.energy()).toBe("medium");
    expect(files.get("Journal/2026/10/2026-10-19.md")).toContain(
      "- [ ] 18:00 Abre Variables y lee 1 minuto",
    );
  });

  it("leaves tomorrow alone without a first step", async () => {
    await rumbo.closeDay.close({ wins: [], tomorrow: { start: "09:00", firstStep: "  " } });

    expect(files.has("Journal/2026/10/2026-10-19.md")).toBe(false);
  });
});
