import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type Rumbo } from "../src";
import {
  goalPace,
  goalProgress,
  groupByPeriod,
  keyResultProgress,
  periodChoices,
  periodHorizon,
  type Goal,
} from "../src/domain/goals";
import { nearestMilestone, projectProgress, type Project } from "../src/domain/projects";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";

const goal: Goal = {
  title: "B2",
  why: "",
  status: "active",
  keyResults: [],
  obstacle: "",
  plans: [],
  resources: [],
};
const project: Project = {
  title: "Web",
  outcome: "Publicada",
  status: "active",
  links: [],
  milestones: [],
  archived: false,
};

describe("goalProgress", () => {
  it("follows its key results when it has them", () => {
    expect(keyResultProgress({ title: "Sesiones", from: 6, target: 80, current: 43 })).toBe(0.5);
    const measured = {
      ...goal,
      keyResults: [
        { title: "a", from: 0, target: 10, current: 3 },
        { title: "b", from: 0, target: 10, current: 7 },
      ],
    };
    expect(goalProgress(measured, { projects: [1], roadmaps: [], habits: [] })).toBe(0.5);
  });

  it("averages what drives it, and is «sin plan» without anything", () => {
    expect(goalProgress(goal, { projects: [1, 0], roadmaps: [0.5], habits: [0.9, 0.1] })).toBe(0.5);
    expect(goalProgress(goal, { projects: [], roadmaps: [], habits: [] })).toBeUndefined();
    expect(
      goalProgress({ ...goal, status: "done" }, { projects: [], roadmaps: [], habits: [] }),
    ).toBe(1);
  });
});

describe("goalPace", () => {
  const today = "2026-10-15";
  const running: Goal = { ...goal, start: "2026-09-15", deadline: "2026-12-14" };

  it("compares what you average with what the deadline asks, with a 10 % margin", () => {
    const required = (7 * (1 - 1 / 3)) / 60;
    expect(goalPace(running, 0.5, today)?.state).toBe("ahead");
    expect(goalPace(running, 0.2, today)?.state).toBe("behind");
    const even = goalPace(running, 1 / 3, today)!;
    expect(even.state).toBe("on-track");
    expect(even.requiredPerWeek).toBeCloseTo(required);
    expect(even.actualPerWeek).toBeCloseTo(7 / 90);
  });

  it("only knows what is needed during the first week", () => {
    expect(goalPace({ ...running, start: "2026-10-12" }, 0.1, today)).toEqual({
      requiredPerWeek: (0.9 / 60) * 7,
    });
  });

  it("is behind once the deadline has passed", () => {
    expect(goalPace({ ...running, deadline: "2026-10-01" }, 0.9, today)?.state).toBe("behind");
  });

  it("does not apply without a deadline, progress, or while not active or unfinished", () => {
    expect(goalPace({ ...running, deadline: undefined }, 0.5, today)).toBeUndefined();
    expect(goalPace(running, undefined, today)).toBeUndefined();
    expect(goalPace(running, 1, today)).toBeUndefined();
    expect(goalPace({ ...running, status: "paused" }, 0.5, today)).toBeUndefined();
  });
});

describe("periods", () => {
  it("tells a year from a quarter", () => {
    expect(periodHorizon("2027")).toBe("year");
    expect(periodHorizon("2027-T3")).toBe("quarter");
  });

  it("offers this year, the next and the coming quarters", () => {
    expect(periodChoices("2026-10-15")).toEqual([
      "2026",
      "2027",
      "2026-T4",
      "2027-T1",
      "2027-T2",
      "2027-T3",
    ]);
  });

  it("groups by year and then quarter, without period last", () => {
    const at = (period?: string) => ({ goal: { ...goal, period } });
    const groups = groupByPeriod([
      at(),
      at("2027-T2"),
      at("2026"),
      at("2027"),
      at("2027-T1"),
      at("2027-T2"),
    ]);
    expect(
      groups.map(({ year, quarters }) => [
        year,
        quarters.map(({ quarter, items }) => [quarter, items.length]),
      ]),
    ).toEqual([
      ["2026", [[undefined, 1]]],
      [
        "2027",
        [
          [undefined, 1],
          ["T1", 1],
          ["T2", 2],
        ],
      ],
      [undefined, [[undefined, 1]]],
    ]);
  });
});

describe("projectProgress", () => {
  it("counts milestones first, then tasks", () => {
    const withMilestones = {
      ...project,
      milestones: [
        { title: "A", done: true },
        { title: "B", done: false },
      ],
    };
    expect(projectProgress(withMilestones, [{ done: false }])).toBe(0.5);
    expect(
      projectProgress(project, [{ done: true }, { done: false }, { done: false }, { done: false }]),
    ).toBe(0.25);
    expect(projectProgress({ ...project, status: "done" }, [])).toBe(1);
  });
});

const clock = { now: () => new Date(2026, 9, 15, 10, 0) };
let rumbo: Rumbo;

beforeEach(async () => {
  rumbo = await createRumbo({
    fs: memoryFileSystem(await loadDemoVault()),
    database: memoryDatabase(),
    clock,
  });
});

describe("goals", () => {
  it("imports the goal notes once", () => {
    expect(
      rumbo.goals
        .list()
        .map(({ goal: imported }) => [imported.title, imported.area, imported.period]),
    ).toEqual([["Learn Python", "Python", "2027"]]);
  });

  it("creates a goal connected to what drives it, and computes its progress", async () => {
    const projectId = await rumbo.projects.create({ ...project, title: "Entrevista simulada" }, [
      "Preparar 10 preguntas",
      "Grabar la simulación",
    ]);
    const id = await rumbo.goals.create(
      {
        ...goal,
        title: "Inglés fluido en entrevista",
        why: "Trabajar fuera",
        deadline: "2027-10-14",
        obstacle: "Me da vergüenza",
        plans: [{ if: "lo dejo", then: "reservo 3 clases el domingo" }],
        resources: [{ title: "Nation", url: "https://x.org", kind: "article", status: "pending" }],
      },
      {
        projects: [projectId!],
        habits: ["reading"],
        roadmaps: ["Python basics"],
        notes: ["Python"],
      },
    );

    const summary = rumbo.goals.get(id!)!;
    expect(summary.projects.map((p) => p.project.title)).toEqual(["Entrevista simulada"]);
    expect(summary.habits.map((h) => h.habit.key)).toEqual(["reading"]);
    expect(summary.roadmaps.map((r) => r.title)).toEqual(["Python basics"]);
    expect(summary.notes.map((note) => note.name)).toEqual(["Python"]);
    expect(summary.tasks.map((task) => task.text)).toEqual([
      "Preparar 10 preguntas",
      "Grabar la simulación",
    ]);
    expect(summary.goal.resources).toEqual([
      { title: "Nation", url: "https://x.org", kind: "article", status: "pending" },
    ]);
    expect(summary.goal.plans).toEqual([{ if: "lo dejo", then: "reservo 3 clases el domingo" }]);
    expect(summary.daysLeft).toBe(364);
    expect(summary.pace?.requiredPerWeek).toBeGreaterThan(0);
    expect(summary.milestone).toBeUndefined();
    expect(summary.progress).toBeGreaterThan(0);
    expect(rumbo.tasks.goalOf({ projectId })).toBe("Inglés fluido en entrevista");
  });

  it("tracks, adds and removes key results one by one", async () => {
    const id = await rumbo.goals.create({
      ...goal,
      keyResults: [
        { title: "Sesiones", from: 6, target: 80, unit: "sesiones" },
        { title: "Vocabulario", from: 0, target: 100 },
      ],
    });
    await rumbo.goals.changeKeyResult(id!, 0, { current: 80 });
    expect(rumbo.goals.get(id!)!.goal.keyResults[0]!.current).toBe(80);
    expect(rumbo.goals.get(id!)!.progress).toBe(0.5);

    await rumbo.goals.addKeyResult(id!, { title: "Clases", from: 0, target: 20 });
    await rumbo.goals.changeKeyResult(id!, 2, { target: 40, unit: "clases" });
    expect(rumbo.goals.get(id!)!.goal.keyResults[2]).toEqual({
      title: "Clases",
      from: 0,
      target: 40,
      unit: "clases",
    });

    await rumbo.goals.removeKeyResult(id!, 1);
    expect(rumbo.goals.get(id!)!.goal.keyResults.map((keyResult) => keyResult.title)).toEqual([
      "Sesiones",
      "Clases",
    ]);
  });

  it("connects and disconnects each kind of driver one by one", async () => {
    const id = (await rumbo.goals.create(goal))!;
    const other = (await rumbo.goals.create({ ...goal, title: "Otro" }))!;
    const projectId = (await rumbo.projects.create(project))!;
    const task = (await rumbo.tasks.create({ text: "Llamar" }))!;
    const links = [
      { kind: "project", id: projectId },
      { kind: "habit", key: "reading" },
      { kind: "roadmap", name: "Python basics" },
      { kind: "note", name: "Python" },
      { kind: "task", id: task.id },
    ] as const;

    for (const link of links) await rumbo.goals.connect(id, link);
    const connected = rumbo.goals.get(id)!;
    expect(connected.projects).toHaveLength(1);
    expect(connected.habits.map(({ habit }) => habit.key)).toEqual(["reading"]);
    expect(connected.roadmaps.map(({ name }) => name)).toEqual(["Python basics"]);
    expect(connected.notes.map(({ name }) => name)).toEqual(["Python"]);
    expect(connected.tasks.map(({ text }) => text)).toEqual(["Llamar"]);

    await rumbo.goals.connect(other, links[1]);
    expect(rumbo.goals.get(id)!.habits).toEqual([]);
    expect(rumbo.goals.get(other)!.habits).toHaveLength(1);

    for (const link of links) await rumbo.goals.disconnect(id, link);
    const empty = rumbo.goals.get(id)!;
    expect([empty.projects, empty.roadmaps, empty.notes, empty.tasks]).toEqual([[], [], [], []]);
  });

  it("changes only what it is given", async () => {
    const id = await rumbo.goals.create({ ...goal, title: "B2", area: "Python", why: "Viajar" });
    await rumbo.goals.update(id!, { area: undefined, period: "2027-T1", horizon: "quarter" });
    const { goal: changed } = rumbo.goals.get(id!)!;
    expect([changed.title, changed.why, changed.area, changed.period]).toEqual([
      "B2",
      "Viajar",
      undefined,
      "2027-T1",
    ]);
  });

  it("brings the tasks connected straight to it, and starts today", async () => {
    const id = await rumbo.goals.create(goal);
    await rumbo.tasks.create({ text: "Apuntarme a un intercambio", goalId: id });
    const summary = rumbo.goals.get(id!)!;
    expect(summary.goal.start).toBe("2026-10-15");
    expect(summary.tasks.map((task) => task.text)).toEqual(["Apuntarme a un intercambio"]);
    expect(rumbo.tasks.goalOf({ goalId: id })).toBe("B2");
  });

  it("keeps projects and habits when a goal is removed", async () => {
    const id = await rumbo.goals.create(goal, {
      projects: [],
      habits: ["reading"],
      roadmaps: [],
      notes: [],
    });
    await rumbo.goals.remove(id!);
    expect(rumbo.goals.get(id!)).toBeUndefined();
    expect(rumbo.habits.get("reading")).toBeDefined();
  });
});

describe("nearestMilestone", () => {
  it("is the earliest dated milestone still to do, with its project", () => {
    const planned = (title: string, ...dates: [string | undefined, boolean][]) => ({
      ...project,
      title,
      milestones: dates.map(([date, done], index) => ({ title: `${title} ${index}`, date, done })),
    });
    const found = nearestMilestone([
      planned("Web", ["2026-12-01", false], ["2026-10-01", true]),
      planned("App", [undefined, false], ["2026-11-10", false]),
    ]);
    expect(found).toEqual({ project: "App", title: "App 1", date: "2026-11-10" });
    expect(nearestMilestone([planned("Web", ["2026-10-01", true])])).toBeUndefined();
  });
});

describe("projects", () => {
  it("creates a project with its first tasks and follows its progress", async () => {
    const id = await rumbo.projects.create(
      { ...project, area: "Python", milestones: [{ title: "Landing", done: false }] },
      ["Dominio", "Logo"],
    );
    const summary = rumbo.projects.get(id!)!;
    expect(summary.nextTasks.map((task) => [task.text, task.area])).toEqual([
      ["Dominio", "Python"],
      ["Logo", "Python"],
    ]);
    expect(summary.progress).toBe(0);

    await rumbo.projects.setMilestone(id!, 0, true);
    expect(rumbo.projects.get(id!)!.progress).toBe(1);
  });

  it("dates when it is finished, archives it and removes it", async () => {
    const id = await rumbo.projects.create(project);
    await rumbo.projects.setStatus(id!, "done");
    expect(rumbo.projects.get(id!)!.project.finished).toBe("2026-10-15");

    await rumbo.projects.archive(id!);
    expect(rumbo.projects.list()).toEqual([]);

    await rumbo.projects.remove(id!);
    expect(rumbo.projects.get(id!)).toBeUndefined();
  });
});
