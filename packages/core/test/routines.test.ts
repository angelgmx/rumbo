import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type Rumbo } from "../src";
import { habitSchema } from "../src/domain/habits";
import {
  blockTitle,
  insertBlock,
  isRoutineOn,
  moduleBlockTasks,
  moveBlock,
  nextRoutineDay,
  removeBlock,
  routineClashes,
  routineEnd,
  routineSchema,
  timedBlocks,
  updateBlock,
  weeklyCompliance,
} from "../src/domain/routines";
import { parseNote } from "../src/vault/frontmatter";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";

const routine = routineSchema.parse({
  start: "18:00",
  days: ["mon", "wed"],
  blocks: [
    { kind: "habit", ref: "[[Hábito — Inglés]]", minutes: 15 },
    { kind: "module", ref: "[[Java desde cero]]", minutes: 45 },
    { kind: "break", minutes: 10 },
  ],
});

describe("routine domain", () => {
  it("gives every block its time, one after the other", () => {
    expect(timedBlocks(routine).map(({ start, end }) => [start, end])).toEqual([
      ["18:00", "18:15"],
      ["18:15", "19:00"],
      ["19:00", "19:10"],
    ]);
    expect(routineEnd(routine)).toBe("19:10");
  });

  it("runs on its days only while active", () => {
    // 2026-10-19 es lunes; el 20, martes.
    expect(isRoutineOn(routine, "2026-10-19")).toBe(true);
    expect(isRoutineOn(routine, "2026-10-20")).toBe(false);
    expect(isRoutineOn({ ...routine, active: false }, "2026-10-19")).toBe(false);
  });

  it("names blocks by their title or their note", () => {
    expect(routine.blocks.map(blockTitle)).toEqual([
      "Hábito — Inglés",
      "Java desde cero",
      "Descanso",
    ]);
  });

  it("moves a block and ignores impossible moves", () => {
    expect(moveBlock(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveBlock(["a", "b"], 0, 5)).toEqual(["a", "b"]);
  });

  it("adds, removes and edits blocks without touching the others", () => {
    expect(insertBlock(["a", "c"], "b", 1)).toEqual(["a", "b", "c"]);
    expect(insertBlock(["a"], "b")).toEqual(["a", "b"]);
    expect(removeBlock(["a", "b", "c"], 1)).toEqual(["a", "c"]);
    expect(updateBlock([{ minutes: 10, x: 1 }], 0, { minutes: 20 })).toEqual([
      { minutes: 20, x: 1 },
    ]);
  });

  it("finds the next day it runs", () => {
    // Desde el lunes 19, la siguiente es el miércoles 21.
    expect(nextRoutineDay(routine, "2026-10-19")).toBe("2026-10-21");
    expect(nextRoutineDay({ ...routine, active: false }, "2026-10-19")).toBeUndefined();
  });

  it("detects routines that overlap on a shared day", () => {
    const gym = routineSchema.parse({ start: "19:00", days: ["wed", "fri"], blocks: [] });
    const gymWithBlocks = { ...gym, blocks: [{ kind: "custom" as const, minutes: 60 }] };
    const late = { ...gymWithBlocks, start: "20:00" };
    expect(routineClashes(routine, [{ title: "Gym", routine: gymWithBlocks }])).toEqual([
      { title: "Gym", days: ["wed"] },
    ]);
    expect(routineClashes(routine, [{ title: "Gym", routine: late }])).toEqual([]);
  });

  it("measures how often its habits were done on its days", () => {
    const habit = habitSchema.parse({ key: "ingles", name: "Inglés" });
    // Semana del lunes 12: tocaba lunes 12 y miércoles 14, se hizo uno.
    const history = new Map([
      ["2026-10-12", true],
      ["2026-10-19", true],
    ]);
    const weeks = weeklyCompliance(routine, [{ habit, history }], "2026-10-19", 2);
    expect(weeks).toEqual([0.5, 1]);
    expect(weeklyCompliance(routine, [], "2026-10-19")).toEqual([]);
  });

  it("turns a topic block into today's tasks with their estimate and steps", () => {
    const tasks = moduleBlockTasks(
      {
        roadmapTitle: "Java",
        moduleTitle: "Strings",
        habit: "programacion",
        pendingExercises: [
          { id: "03", title: "a" },
          { id: "04", title: "b" },
          { id: "05", title: "c" },
          { id: "06", title: "d" },
        ],
        pendingResource: { title: "Platzi clase 14", minutes: 30 },
      },
      routine.blocks[1]!,
      "2026-10-19",
    );
    expect(tasks).toEqual([
      {
        text: "Java · Strings: ver Platzi clase 14",
        scheduled: "2026-10-19",
        habit: "programacion",
        area: undefined,
        duration: 30,
      },
      {
        text: "Java · Strings: ejercicios 03–05",
        scheduled: "2026-10-19",
        habit: "programacion",
        area: undefined,
        steps: [
          { text: "03 — a", done: false },
          { text: "04 — b", done: false },
          { text: "05 — c", done: false },
        ],
      },
    ]);
  });

  it("asks to review the topic when nothing is left", () => {
    const [task] = moduleBlockTasks(
      { roadmapTitle: "Java", moduleTitle: "Strings", pendingExercises: [] },
      routine.blocks[1]!,
      "2026-10-19",
    );
    expect(task).toMatchObject({ duration: 45 });
    expect(task!.text).toContain("repasar");
  });
});

// El 2026-10-16 es viernes: toca la rutina de ejemplo (lunes, miércoles y viernes).
const clock = { now: () => new Date(2026, 9, 16, 10, 0) };
const ROUTINE = "Routines/Evening study.md";

let files: Map<string, string>;
let rumbo: Rumbo;

beforeEach(async () => {
  files = await loadDemoVault();
  rumbo = await createRumbo(memoryFileSystem(files), clock);
});

describe("RoutineService", () => {
  it("lists the routines with their blocks and times", () => {
    const { routines, invalid } = rumbo.routines.list();
    expect(invalid).toEqual([]);
    expect(routines[0]).toMatchObject({ title: "Evening study", minutes: 80, end: "19:20" });
    expect(rumbo.routines.today().map((summary) => summary.title)).toEqual(["Evening study"]);
  });

  it("turns it on and off", async () => {
    await rumbo.routines.setActive(ROUTINE, false);
    expect(rumbo.routines.today()).toEqual([]);
  });

  it("removes the routine note", async () => {
    const path = await rumbo.routines.create({
      title: "Borrar",
      days: "daily",
      start: "07:00",
      blocks: [],
    });

    await rumbo.routines.remove(path);

    expect(files.has(path)).toBe(false);
    expect(rumbo.routines.list().routines.some((summary) => summary.path === path)).toBe(false);
  });

  it("creates a routine from a template", async () => {
    const path = await rumbo.routines.createFromTemplate("study", { area: "Python" });
    expect(path).toBe("Routines/Rutina de estudio.md");
    const note = parseNote(files.get(path)!);
    expect(note.data).toMatchObject({ type: "routine", area: "[[Python]]", start: "18:00" });
    expect(await rumbo.routines.createFromTemplate("study")).toBe(
      "Routines/Rutina de estudio 2.md",
    );
  });

  it("knows its habits, its weeks and the routines it clashes with", () => {
    const [summary] = rumbo.routines.list().routines;
    expect(summary!.habits.map(({ habit }) => habit.key)).toEqual(["reading"]);
    expect(summary!.weeks).toHaveLength(4);
    expect(summary!.next).toBeUndefined();
    expect(summary!.clashes).toEqual([]);
  });

  it("changes its time and its blocks", async () => {
    await rumbo.routines.update(ROUTINE, { start: "19:00" });
    await rumbo.routines.addBlock(ROUTINE, { kind: "break", minutes: 5 }, 0);
    await rumbo.routines.updateBlock(ROUTINE, 1, { minutes: 20 });
    await rumbo.routines.removeBlock(ROUTINE, 4);
    const [summary] = rumbo.routines.list().routines;
    expect(summary!.blocks.map(({ kind, start }) => [kind, start])).toEqual([
      ["break", "19:00"],
      ["habit", "19:05"],
      ["module", "19:25"],
      ["break", "20:10"],
    ]);
    expect(files.get(ROUTINE)).toContain("- kind: break\n    minutes: 5");
  });

  it("reorders the blocks", async () => {
    await rumbo.routines.moveBlock(ROUTINE, 3, 0);
    const [first] = rumbo.routines.list().routines[0]!.blocks;
    expect(first).toMatchObject({ kind: "custom", start: "18:00", end: "18:10" });
  });

  it("creates the tasks of a topic block once", async () => {
    const [summary] = rumbo.routines.today();
    const created = await rumbo.routines.planBlock(summary!, 1);
    expect(created.map((task) => task.text)).toEqual([
      "Python basics · Variables: ejercicios 01–03",
    ]);
    expect(files.get("Inbox/Inbox.md")).toContain(
      "Python basics · Variables: ejercicios 01–03 ⏳ 2026-10-16\n    - [ ] 01 — ",
    );
    expect(await rumbo.routines.planBlock(summary!, 1)).toEqual([]);
  });

  it("logs the habit of a block in today's daily", async () => {
    const [summary] = rumbo.routines.today();
    await rumbo.routines.completeBlock(summary!, 0);
    const daily = parseNote(files.get("Journal/2026/10/2026-10-16.md")!);
    expect(daily.data.habits).toMatchObject({ reading: 20 });
  });

  it("starts the topic of a block that was not started", async () => {
    files.set(
      "Areas/Python/Notes/01 - Variables/Mastery — Variables.md",
      files
        .get("Areas/Python/Notes/01 - Variables/Mastery — Variables.md")!
        .replace("status: learning", "status: not-started"),
    );
    rumbo = await createRumbo(memoryFileSystem(files), clock);
    const [summary] = rumbo.routines.today();
    await rumbo.routines.completeBlock(summary!, 1);
    expect(files.get("Areas/Python/Notes/01 - Variables/Mastery — Variables.md")).toContain(
      "status: learning",
    );
  });
});
