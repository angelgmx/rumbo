import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, isoWeek, type Rumbo, type Task } from "../src";
import {
  areaKey,
  dayGaps,
  deadlinesBetween,
  freeMinutes,
  layoutLanes,
  placeTask,
  resizeTask,
  snapMinutes,
  sourceCount,
  sourceKey,
  sourceTasks,
} from "../src/domain/calendar";
import { freeIntervals } from "../src/domain/freeTime";
import { habitStep } from "../src/domain/habits";
import type { Goal } from "../src/domain/goals";
import type { Project } from "../src/domain/projects";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";
import { makeHabit } from "./makeHabit";

let nextId = 1;
function task(fields: Partial<Task> = {}): Task {
  return {
    id: nextId++,
    text: "Revisar la landing",
    done: false,
    tags: [],
    spent: 0,
    steps: [],
    notes: "",
    created: "2026-10-16",
    ...fields,
  };
}

describe("freeIntervals", () => {
  it("returns what is left between the busy intervals, however they overlap", () => {
    const busy = [
      { start: "12:00", end: "13:00" },
      { start: "09:00", end: "10:30" },
      { start: "10:00", end: "11:00" },
    ];
    expect(freeIntervals(busy, "08:00", "14:00", 30)).toEqual([
      { start: "08:00", end: "09:00" },
      { start: "11:00", end: "12:00" },
      { start: "13:00", end: "14:00" },
    ]);
  });

  it("drops what is shorter than the minimum and what falls outside the window", () => {
    const busy = [{ start: "08:30", end: "20:00" }];
    expect(freeIntervals(busy, "08:00", "21:00", 60)).toEqual([{ start: "20:00", end: "21:00" }]);
    expect(freeIntervals([], "21:00", "21:00", 30)).toEqual([]);
  });
});

describe("snapMinutes, placeTask and resizeTask", () => {
  it("snaps to quarters of an hour", () => {
    expect(snapMinutes(7 * 60 + 8)).toBe(7 * 60 + 15);
    expect(snapMinutes(7 * 60 + 7)).toBe(7 * 60);
  });

  it("puts a task on a day and an hour, giving it a short duration if it had none", () => {
    expect(placeTask(task(), "2026-10-17", 15 * 60 + 5)).toEqual({
      scheduled: "2026-10-17",
      time: "15:00",
      duration: 30,
    });
    expect(placeTask(task({ duration: 90 }), "2026-10-17", 600)).toEqual({
      scheduled: "2026-10-17",
      time: "10:00",
      duration: 90,
    });
  });

  it("keeps the task inside the day", () => {
    expect(placeTask(task({ duration: 60 }), "2026-10-17", 23 * 60 + 45).time).toBe("23:00");
    expect(placeTask(task(), "2026-10-17", -40).time).toBe("00:00");
  });

  it("resizes in quarters of an hour, never below fifteen minutes", () => {
    expect(resizeTask(100)).toEqual({ duration: 105 });
    expect(resizeTask(3)).toEqual({ duration: 15 });
  });
});

describe("layoutLanes", () => {
  const at = (start: string, end: string) => ({ start, end });

  it("gives what does not overlap the whole width", () => {
    const placed = layoutLanes([at("09:00", "10:00"), at("10:00", "11:00")]);
    expect(placed.map(({ lane, lanes }) => [lane, lanes])).toEqual([
      [0, 1],
      [0, 1],
    ]);
  });

  it("puts what overlaps side by side and reuses a free column", () => {
    const placed = layoutLanes([
      at("09:00", "11:00"),
      at("09:30", "10:00"),
      at("10:00", "10:30"),
      at("12:00", "13:00"),
    ]);
    expect(placed.map(({ item, lane, lanes }) => [item.start, lane, lanes])).toEqual([
      ["09:00", 0, 2],
      ["09:30", 1, 2],
      ["10:00", 1, 2],
      ["12:00", 0, 1],
    ]);
  });
});

describe("dayGaps", () => {
  const busy = [
    { start: "10:00", end: "12:00" },
    { start: "17:00", end: "19:00" },
  ];

  it("keeps only long gaps inside the day", () => {
    const gaps = dayGaps(busy, "2026-10-17", "2026-10-16", "09:00");
    expect(gaps).toEqual([
      { start: "08:00", end: "10:00" },
      { start: "12:00", end: "17:00" },
      { start: "19:00", end: "22:00" },
    ]);
    expect(freeMinutes(gaps)).toBe(10 * 60);
  });

  it("counts today from now and has none for days gone by", () => {
    expect(dayGaps(busy, "2026-10-16", "2026-10-16", "13:30")).toEqual([
      { start: "13:30", end: "17:00" },
      { start: "19:00", end: "22:00" },
    ]);
    expect(dayGaps([], "2026-10-15", "2026-10-16", "09:00")).toEqual([]);
  });
});

describe("deadlinesBetween", () => {
  const goal = (fields: Partial<Goal>): Goal => ({
    title: "Primer trabajo dev",
    why: "",
    status: "active",
    keyResults: [],
    obstacle: "",
    plans: [],
    resources: [],
    ...fields,
  });
  const project = (fields: Partial<Project>): Project => ({
    title: "Landing Citalash",
    outcome: "",
    status: "active",
    links: [],
    milestones: [],
    archived: false,
    ...fields,
  });

  it("gathers the deadlines of goals, projects and their milestones, by date", () => {
    const found = deadlinesBetween(
      [goal({ deadline: "2026-10-18" })],
      [
        project({
          area: "Citalash",
          deadline: "2026-10-15",
          milestones: [
            { title: "Strings", date: "2026-10-16", done: false },
            { title: "Hecho", date: "2026-10-16", done: true },
            { title: "Sin fecha", done: false },
          ],
        }),
      ],
      "2026-10-14",
      "2026-10-18",
    );
    expect(found.map(({ kind, date, title }) => [kind, date, title])).toEqual([
      ["project", "2026-10-15", "Landing Citalash"],
      ["milestone", "2026-10-16", "Strings"],
      ["goal", "2026-10-18", "Primer trabajo dev"],
    ]);
    expect(found[0]!.area).toBe("Citalash");
  });

  it("leaves out what is finished, archived or outside the range", () => {
    expect(
      deadlinesBetween(
        [goal({ deadline: "2026-10-16", status: "done" }), goal({ deadline: "2026-11-01" })],
        [
          project({ deadline: "2026-10-16", archived: true }),
          project({ deadline: "2026-10-16", status: "done" }),
        ],
        "2026-10-14",
        "2026-10-18",
      ),
    ).toEqual([]);
  });
});

describe("sourceTasks", () => {
  const week = { from: "2026-10-12", to: "2026-10-18" };
  const today = "2026-10-16";
  const inbox = task({ text: "Inbox" });
  const loose = task({ text: "Loose", area: "Citalash" });
  const looseElsewhere = task({ text: "Other", area: "Gym" });
  const placed = task({ text: "Placed", area: "Citalash", scheduled: "2026-10-17" });
  const later = task({ text: "Later", area: "Citalash", scheduled: "2026-10-25" });
  const finished = task({
    text: "Finished",
    area: "Citalash",
    scheduled: "2026-10-14",
    done: true,
  });
  const tasks = [inbox, loose, looseElsewhere, placed, later, finished];

  it("offers the unprocessed tasks for the inbox", () => {
    expect(sourceTasks(tasks, { kind: "inbox" }, week, today)).toEqual({
      undated: [inbox],
      scheduled: [],
    });
  });

  it("offers every pending task without a day for «sin fecha»", () => {
    expect(sourceTasks(tasks, { kind: "undated" }, week, today).undated).toEqual([
      inbox,
      loose,
      looseElsewhere,
    ]);
  });

  it("splits an area into what has no day and what falls in the week", () => {
    const own = sourceTasks(tasks, { kind: "area", area: "Citalash" }, week, today);
    expect(own.undated).toEqual([loose]);
    expect(own.scheduled).toEqual([placed, finished]);
    expect(sourceCount(own)).toBe(2);
  });

  it("has no tasks for the routines", () => {
    expect(sourceTasks(tasks, { kind: "routines" }, week, today)).toEqual({
      undated: [],
      scheduled: [],
    });
  });

  it("keys what has no area under the inbox", () => {
    expect(sourceKey({ kind: "area", area: "Gym" })).toBe(areaKey("Gym"));
    expect(areaKey(undefined)).toBe(sourceKey({ kind: "inbox" }));
  });
});

describe("isoWeek and habitStep", () => {
  it("numbers the weeks the ISO way", () => {
    expect(isoWeek("2026-10-16")).toBe(42);
    expect(isoWeek("2026-10-12")).toBe(42);
    expect(isoWeek("2026-10-18")).toBe(42);
    expect(isoWeek("2026-01-01")).toBe(1);
    expect(isoWeek("2027-01-01")).toBe(53);
  });

  it("adds a minute-sized step for amounts and five minutes for time", () => {
    expect(habitStep(makeHabit({ key: "agua", name: "Agua", kind: "count" }))).toBe(1);
    expect(habitStep(makeHabit({ key: "leer", name: "Leer", kind: "duration" }))).toBe(5);
  });
});

describe("CalendarService", () => {
  let rumbo: Rumbo;

  beforeEach(async () => {
    rumbo = await createRumbo({
      fs: memoryFileSystem(await loadDemoVault()),
      database: memoryDatabase(),
      // Viernes 16 de octubre de 2026, a las 9:00.
      clock: { now: () => new Date(2026, 9, 16, 9, 0) },
    });
    for (const { id } of rumbo.routines.list()) await rumbo.routines.remove(id);
  });

  it("puts timed tasks, habits and routines in their day, in order", async () => {
    await rumbo.tasks.create({
      text: "Enviar CV",
      scheduled: "2026-10-16",
      time: "13:30",
      duration: 60,
    });
    await rumbo.tasks.create({ text: "Sin hora", scheduled: "2026-10-16" });
    await rumbo.habits.create({
      name: "Gym",
      kind: "check",
      schedule: ["fri"],
      start: "10:00",
      end: "11:30",
    });
    await rumbo.routines.create({
      title: "Estudio Java",
      start: "17:00",
      days: ["fri"],
      blocks: [{ kind: "activity", title: "Repasar", minutes: 120 }],
    });

    const [friday, saturday] = await rumbo.calendar.days("2026-10-16", 2);

    expect(friday!.events.map(({ kind, start, end }) => [kind, start, end])).toEqual([
      ["habit", "10:00", "11:30"],
      ["task", "13:30", "14:30"],
      ["routine", "17:00", "19:00"],
    ]);
    expect(friday!.untimed.map(({ text }) => text)).toEqual(["Sin hora"]);
    expect(saturday!.events).toEqual([]);
  });

  it("leaves a habit out of the loose events when a routine already holds it", async () => {
    const key = await rumbo.habits.create({
      name: "Repaso",
      kind: "check",
      schedule: "daily",
      start: "17:00",
      end: "17:15",
    });
    await rumbo.routines.create({
      title: "Estudio",
      start: "17:00",
      blocks: [{ kind: "habit", ref: key, minutes: 15 }],
    });

    const [day] = await rumbo.calendar.days("2026-10-16", 1);

    expect(day!.events.map(({ kind }) => kind)).toEqual(["routine"]);
  });

  it("checks routine steps against the habit of that very day", async () => {
    const key = await rumbo.habits.create({ name: "Repaso", kind: "check", schedule: "daily" });
    await rumbo.routines.create({
      title: "Estudio",
      start: "17:00",
      blocks: [{ kind: "habit", ref: key, minutes: 15 }],
    });
    await rumbo.habits.setValue(key, true, "2026-10-15");

    const days = await rumbo.calendar.days("2026-10-15", 3);
    const done = days.map((day) => {
      const event = day.events.find(({ kind }) => kind === "routine");
      return event?.kind === "routine" ? event.steps.map(({ done: ok }) => ok) : undefined;
    });

    expect(done).toEqual([[true], [false], [false]]);
  });

  it("leaves a gap where nothing is planned and none before now", async () => {
    await rumbo.tasks.create({
      text: "Comida",
      scheduled: "2026-10-16",
      time: "12:00",
      duration: 120,
    });

    const [today, yesterday] = [
      (await rumbo.calendar.days("2026-10-16", 1))[0]!,
      (await rumbo.calendar.days("2026-10-15", 1))[0]!,
    ];

    expect(today.gaps).toEqual([
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "22:00" },
    ]);
    expect(yesterday.gaps).toEqual([]);
  });

  it("marks the days with a deadline, including tasks that are due", async () => {
    await rumbo.tasks.create({ text: "Entregar", due: "2026-10-20" });

    const days = rumbo.calendar.deadlineDays("2026-10-14", "2026-10-21");

    expect(days.has("2026-10-20")).toBe(true);
    expect(days.has("2026-10-19")).toBe(false);
  });
});
