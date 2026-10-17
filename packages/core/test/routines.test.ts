import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type Rumbo, type Task } from "../src";
import {
  blockTitle,
  insertBlock,
  isRoutineOn,
  moduleBlockTasks,
  moveBlock,
  removeBlock,
  routineClashes,
  routineEnd,
  routineSchema,
  taskClashes,
  timedBlocks,
  updateBlock,
} from "../src/domain/routines";
import { parseNoteRoutine } from "../src/domain/noteRoutines";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";

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

  it("runs only inside its validity, both days included", () => {
    const limited = { ...routine, days: "daily" as const, from: "2026-10-19", until: "2026-10-21" };
    expect(isRoutineOn(limited, "2026-10-18")).toBe(false);
    expect(isRoutineOn(limited, "2026-10-19")).toBe(true);
    expect(isRoutineOn(limited, "2026-10-21")).toBe(true);
    expect(isRoutineOn(limited, "2026-10-22")).toBe(false);
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

  it("detects routines that overlap on a shared day", () => {
    const gym = routineSchema.parse({ start: "19:00", days: ["wed", "fri"], blocks: [] });
    const gymWithBlocks = { ...gym, blocks: [{ kind: "activity" as const, minutes: 60 }] };
    const late = { ...gymWithBlocks, start: "20:00" };
    expect(routineClashes(routine, [{ title: "Gym", routine: gymWithBlocks }])).toEqual([
      { title: "Gym", days: ["wed"] },
    ]);
    expect(routineClashes(routine, [{ title: "Gym", routine: late }])).toEqual([]);
  });

  it("detects timed tasks that fall inside it on a day it runs", () => {
    const task = (id: number, changes: Partial<Task>): Task => ({
      id,
      text: `Task ${id}`,
      done: false,
      inProgress: false,
      tags: [],
      spent: 0,
      steps: [],
      notes: "",
      created: "2026-10-01",
      ...changes,
    });
    const tasks = [
      task(1, { scheduled: "2026-10-21", time: "18:30", duration: 15 }),
      task(2, { scheduled: "2026-10-20", time: "18:30" }),
      task(3, { scheduled: "2026-10-19", time: "19:10" }),
      task(4, { scheduled: "2026-10-19", time: "18:05", done: true }),
      task(5, { scheduled: "2026-10-12", time: "18:05" }),
      task(6, { scheduled: "2026-10-19", time: "17:45" }),
      task(7, { scheduled: "2026-10-19" }),
      task(8, { scheduled: "2026-10-19", time: "18:20" }),
    ];
    const withOwnTask = {
      ...routine,
      blocks: [...routine.blocks, { kind: "task" as const, ref: "8", minutes: 10 }],
    };
    expect(taskClashes(routine, tasks, "2026-10-19").map((clash) => clash.task.id)).toEqual([
      6, 8, 1,
    ]);
    expect(taskClashes(withOwnTask, tasks, "2026-10-19").map((clash) => clash.task.id)).toEqual([
      6, 3, 1,
    ]);
    expect(taskClashes({ ...routine, active: false }, tasks, "2026-10-19")).toEqual([]);
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

let files: Map<string, string>;
let rumbo: Rumbo;

beforeEach(async () => {
  files = await loadDemoVault();
  rumbo = await createRumbo({
    fs: memoryFileSystem(files),
    database: memoryDatabase(),
    clock: clock,
  });
});

// La rutina de ejemplo, importada de su nota.
const routineId = () => rumbo.routines.list()[0]!.id;

describe("RoutineService", () => {
  it("imports the routine notes once, with habit blocks by key", () => {
    const routines = rumbo.routines.list();
    expect(routines).toHaveLength(1);
    expect(routines[0]!.routine.blocks[0]).toEqual({ kind: "habit", ref: "reading", minutes: 15 });
    expect(routines[0]).toMatchObject({ title: "Evening study", minutes: 80, end: "19:20" });
    expect(rumbo.routines.today().map((summary) => summary.title)).toEqual(["Evening study"]);
  });

  it("reads the old block kinds of a routine note as activities", () => {
    const imported = parseNoteRoutine(
      {
        name: "Old",
        data: {
          start: "18:00",
          blocks: [
            { kind: "custom", title: "Stretch", minutes: 10 },
            { kind: "task", title: "Tidy desk", minutes: 5 },
            { kind: "task", ref: "7", minutes: 5 },
          ],
        },
      },
      () => undefined,
    );
    expect(imported!.blocks.map(({ kind }) => kind)).toEqual(["activity", "activity", "task"]);
  });

  it("stops running when it is turned off", async () => {
    const id = routineId();
    await rumbo.routines.save(id, { title: "Evening study", start: "18:00", active: false });
    expect(rumbo.routines.today()).toEqual([]);
  });

  it("removes a routine", async () => {
    const id = await rumbo.routines.create({ title: "Borrar", start: "07:00" });
    await rumbo.routines.remove(id!);
    expect(rumbo.routines.get(id!)).toBeUndefined();
  });

  it("replaces a routine with its validity, goal, habit and blocks", async () => {
    const goal = await rumbo.goals.create({
      title: "Inglés B2",
      why: "",
      keyResults: [],
      obstacle: "",
      plans: [],
      resources: [],
    });
    await rumbo.routines.save(routineId(), {
      title: " Mañanas ",
      start: "07:00",
      days: ["mon"],
      from: "2026-10-01",
      until: "2026-12-31",
      goalId: goal,
      habit: "reading",
      active: false,
      blocks: [{ kind: "break", minutes: 5 }],
    });
    expect(rumbo.routines.get(routineId())).toMatchObject({
      title: "Mañanas",
      end: "07:05",
      routine: {
        start: "07:00",
        from: "2026-10-01",
        until: "2026-12-31",
        goalId: goal,
        habit: "reading",
        active: false,
      },
    });
  });

  it("counts the habit it marks even without habit blocks", async () => {
    await rumbo.routines.save(routineId(), {
      title: "Evening study",
      start: "18:00",
      habit: "reading",
      blocks: [{ kind: "break", minutes: 5 }],
    });
    expect(rumbo.routines.get(routineId())!.habits.map(({ habit }) => habit.key)).toEqual([
      "reading",
    ]);
  });

  it("stops running once its validity is over", async () => {
    const id = routineId();
    const input = { title: "Evening study", start: "18:00", days: "daily" as const, blocks: [] };
    await rumbo.routines.save(id, { ...input, until: "2026-10-15" });
    expect(rumbo.routines.today()).toEqual([]);
    await rumbo.routines.save(id, { ...input, from: "2026-10-17" });
    expect(rumbo.routines.today()).toEqual([]);
    await rumbo.routines.save(id, { ...input, from: "2026-10-16", until: "2026-10-16" });
    expect(rumbo.routines.today()).toHaveLength(1);
  });

  it("keeps everything after reopening, without importing twice", async () => {
    const database = memoryDatabase();
    const first = await createRumbo({ fs: memoryFileSystem(files), database, clock });
    const input = {
      title: "Evening study",
      start: "18:00",
      blocks: [{ kind: "break" as const, minutes: 5 }],
    };
    await first.routines.save(first.routines.list()[0]!.id, input);
    const again = await createRumbo({ fs: memoryFileSystem(files), database, clock });
    expect(again.routines.list()).toHaveLength(1);
    expect(again.routines.list()[0]!.routine.blocks).toEqual([{ kind: "break", minutes: 5 }]);
  });

  it("knows its habits", () => {
    const [summary] = rumbo.routines.list();
    expect(summary!.habits.map(({ habit }) => habit.key)).toEqual(["reading"]);
  });

  it("reports the routines and the timed tasks a draft clashes with", async () => {
    const task = await rumbo.tasks.create({ text: "Call", scheduled: "2026-10-16", time: "18:30" });
    const draft = routineSchema.parse({
      start: "18:00",
      blocks: [{ kind: "break", minutes: 60 }],
    });
    const clashes = rumbo.routines.clashes(draft);
    expect(clashes.routines).toEqual([{ title: "Evening study", days: ["mon", "wed", "fri"] }]);
    expect(clashes.tasks.map((clash) => clash.task.id)).toEqual([task!.id]);
    expect(rumbo.routines.clashes(draft, routineId()).routines).toEqual([]);
  });

  it("names a habit block after its habit", async () => {
    expect(rumbo.routines.blockName({ kind: "habit", ref: "reading", minutes: 20 })).toBe(
      "Reading",
    );
    expect(rumbo.routines.blockName({ kind: "habit", ref: "nope", minutes: 20 })).toBe("Hábito");
  });

  it("saves activity and task blocks with what they point to", async () => {
    const database = memoryDatabase();
    rumbo = await createRumbo({ fs: memoryFileSystem(files), database, clock });
    const task = await rumbo.tasks.create({ text: "Renew passport" });
    await rumbo.routines.save(routineId(), {
      title: "Evening study",
      start: "18:00",
      blocks: [
        { kind: "activity", title: "Coffee", minutes: 10 },
        { kind: "task", ref: String(task!.id), minutes: 20 },
      ],
    });
    const again = await createRumbo({ fs: memoryFileSystem(files), database, clock });
    expect(again.routines.list()[0]!.routine.blocks).toEqual([
      { kind: "activity", title: "Coffee", minutes: 10 },
      { kind: "task", ref: String(task!.id), minutes: 20 },
    ]);
    expect(rumbo.routines.blockName({ kind: "task", ref: String(task!.id), minutes: 20 })).toBe(
      "Renew passport",
    );
  });

  it("marks a task block done and lists it as a step", async () => {
    const task = await rumbo.tasks.create({ text: "Renew passport" });
    await rumbo.routines.save(routineId(), {
      title: "Evening study",
      start: "18:00",
      blocks: [
        { kind: "activity", title: "Coffee", minutes: 10 },
        { kind: "task", ref: String(task!.id), minutes: 20 },
      ],
    });
    const [summary] = rumbo.routines.today();
    expect(rumbo.routines.steps(summary!)).toMatchObject([
      { index: 1, title: "Renew passport", start: "18:10", done: false, completable: true },
    ]);
    await rumbo.routines.completeBlock(summary!, 1);
    expect(rumbo.tasks.get(task!.id)!.done).toBe(true);
    expect(rumbo.routines.steps(summary!)[0]).toMatchObject({ done: true, completable: false });
  });

  it("creates the tasks of a topic block once", async () => {
    const [summary] = rumbo.routines.today();
    const created = await rumbo.routines.planBlock(summary!, 1);
    expect(created.map((task) => task.text)).toEqual([
      "Python basics · Variables: ejercicios 01–03",
    ]);
    const saved = rumbo.tasks.all().find((task) => task.text === created[0]!.text);
    expect(saved).toMatchObject({ scheduled: "2026-10-16" });
    expect(saved!.steps[0]!.text).toMatch(/^01 — /);
    expect(await rumbo.routines.planBlock(summary!, 1)).toEqual([]);
  });

  it("logs the habit of a block", async () => {
    const [summary] = rumbo.routines.today();
    await rumbo.routines.completeBlock(summary!, 0);
    expect(rumbo.habits.list().find((h) => h.habit.key === "reading")?.today).toBe(20);
  });

  it("starts the topic of a block that was not started", async () => {
    files.set(
      "Areas/Python/Notes/01 - Variables/Mastery — Variables.md",
      files
        .get("Areas/Python/Notes/01 - Variables/Mastery — Variables.md")!
        .replace("status: learning", "status: not-started"),
    );
    rumbo = await createRumbo({
      fs: memoryFileSystem(files),
      database: memoryDatabase(),
      clock: clock,
    });
    const [summary] = rumbo.routines.today();
    await rumbo.routines.completeBlock(summary!, 1);
    expect(files.get("Areas/Python/Notes/01 - Variables/Mastery — Variables.md")).toContain(
      "status: learning",
    );
  });
});
