import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type Rumbo } from "../src";
import { addDays } from "../src/domain/dates";
import {
  goalPace,
  goalProgress,
  keyResultProgress,
  periodChoices,
  periodHorizon,
  type Goal,
} from "../src/domain/goals";
import {
  nextMilestone,
  projectPace,
  projectProgress,
  projectSteps,
  sortMilestones,
  type Project,
} from "../src/domain/projects";
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
    expect(goalPace(running, 0.25, today)?.state).toBe("behind");
    const even = goalPace(running, 1 / 3, today)!;
    expect(even.state).toBe("on-track");
    expect(even.requiredPerWeek).toBeCloseTo(required);
    expect(even.actualPerWeek).toBeCloseTo(7 / 90);
  });

  it("is at risk with less than half of the needed pace, and says how far off it is", () => {
    const late = goalPace(running, 0.1, today)!;
    expect(late.state).toBe("at-risk");
    expect(late.differencePercent).toBe(-78);
    expect(goalPace(running, 0.5, today)?.differencePercent).toBe(100);
  });

  it("projects the finish day from the pace you keep", () => {
    const projected = goalPace(running, 0.5, today)!.projectedFinish;
    expect(projected).toBe(addDays(today, 30));
    expect(goalPace(running, 0, today)?.projectedFinish).toBeUndefined();
  });

  it("only knows what is needed during the first week", () => {
    expect(goalPace({ ...running, start: "2026-10-12" }, 0.1, today)).toEqual({
      requiredPerWeek: (0.9 / 60) * 7,
    });
  });

  it("is at risk once the deadline has passed", () => {
    expect(goalPace({ ...running, deadline: "2026-10-01" }, 0.9, today)?.state).toBe("at-risk");
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

  it("gives the steps done out of the steps there are", () => {
    const tasks = [{ done: true }, { done: false }, { done: false }];
    expect(projectSteps(project, tasks)).toEqual({ done: 1, total: 3 });
    expect(projectSteps({ ...project, milestones: [{ title: "A", done: true }] }, tasks)).toEqual({
      done: 1,
      total: 1,
    });
  });
});

describe("milestones", () => {
  const milestones = [
    { title: "Lanzamiento", date: "2027-02-01", done: false },
    { title: "Sin fecha", done: false },
    { title: "Marca", date: "2026-09-02", done: true },
    { title: "Landing", date: "2026-10-22", done: false },
  ];

  it("sorts by date, leaving the undated last", () => {
    expect(sortMilestones(milestones).map((milestone) => milestone.title)).toEqual([
      "Marca",
      "Landing",
      "Lanzamiento",
      "Sin fecha",
    ]);
  });

  it("finds the first one left to do", () => {
    const sorted = sortMilestones(milestones);
    expect(nextMilestone({ ...project, milestones: sorted })).toEqual({
      index: 1,
      milestone: sorted[1],
    });
    expect(nextMilestone({ ...project, milestones: [{ title: "A", done: true }] })).toBeUndefined();
  });

  it("measures the pace of a project like the one of a goal", () => {
    const running = { ...project, start: "2026-09-15", deadline: "2026-12-14" };
    expect(projectPace(running, 0.5, "2026-10-15")?.state).toBe("ahead");
    expect(projectPace({ ...running, status: "idea" }, 0.5, "2026-10-15")).toBeUndefined();
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
    expect(summary.projects[0]!.nextTasks.map((task) => task.text)).toEqual([
      "Preparar 10 preguntas",
      "Grabar la simulación",
    ]);
    expect(summary.looseTasks).toEqual([]);
    expect(summary.goal.resources).toEqual([
      { title: "Nation", url: "https://x.org", kind: "article", status: "pending" },
    ]);
    expect(summary.goal.plans).toEqual([{ if: "lo dejo", then: "reservo 3 clases el domingo" }]);
    expect(summary.daysLeft).toBe(364);
    expect(summary.pace?.requiredPerWeek).toBeGreaterThan(0);
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
    expect(connected.looseTasks.map(({ text }) => text)).toEqual(["Llamar"]);

    await rumbo.goals.connect(other, links[1]);
    expect(rumbo.goals.get(id)!.habits).toEqual([]);
    expect(rumbo.goals.get(other)!.habits).toHaveLength(1);

    for (const link of links) await rumbo.goals.disconnect(id, link);
    const empty = rumbo.goals.get(id)!;
    expect([empty.projects, empty.roadmaps, empty.notes, empty.looseTasks]).toEqual([
      [],
      [],
      [],
      [],
    ]);
  });

  it("connects a resource once and disconnects it by its address", async () => {
    const id = (await rumbo.goals.create(goal))!;
    const docs = {
      title: "Docs",
      url: "https://dev.java",
      kind: "docs",
      status: "pending",
    } as const;
    const book = { title: "Libro", kind: "book", status: "pending" } as const;

    for (const resource of [docs, book, docs]) {
      await rumbo.goals.connect(id, { kind: "resource", resource });
    }
    expect(rumbo.goals.get(id)!.goal.resources.map(({ title }) => title)).toEqual([
      "Docs",
      "Libro",
    ]);

    await rumbo.goals.disconnect(id, { kind: "resource", resource: docs });
    await rumbo.goals.disconnect(id, { kind: "resource", resource: book });
    expect(rumbo.goals.get(id)!.goal.resources).toEqual([]);
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
    expect(summary.looseTasks.map((task) => task.text)).toEqual(["Apuntarme a un intercambio"]);
    expect(rumbo.tasks.goalOf({ goalId: id })).toBe("B2");
  });

  it("keeps the priority of a goal", async () => {
    const id = await rumbo.goals.create({ ...goal, priority: "high" });
    expect(rumbo.goals.get(id!)!.goal.priority).toBe("high");
    await rumbo.goals.update(id!, { priority: undefined });
    expect(rumbo.goals.get(id!)!.goal.priority).toBeUndefined();
  });

  it("creates a project already connected, with the area of the goal", async () => {
    const id = await rumbo.goals.create({ ...goal, area: "Python" });
    const projectId = await rumbo.goals.createProject(id!, "  Intercambio de idiomas ");
    const created = rumbo.goals.get(id!)!.projects;
    expect(
      created.map((summary) => [summary.id, summary.project.title, summary.project.area]),
    ).toEqual([[projectId, "Intercambio de idiomas", "Python"]]);
  });

  it("creates loose tasks from a natural language title", async () => {
    const id = await rumbo.goals.create({ ...goal, area: "Python" });
    const task = await rumbo.goals.createTask(id!, "Buscar pareja en Tandem hoy 30m !alta");
    expect(task).toMatchObject({
      text: "Buscar pareja en Tandem",
      scheduled: "2026-10-15",
      duration: 30,
      priority: "high",
      goalId: id,
      area: "Python",
    });
    expect(rumbo.goals.get(id!)!.looseTasks.map(({ text }) => text)).toEqual([
      "Buscar pareja en Tandem",
    ]);
  });

  it("creates the tasks of a project inheriting its area", async () => {
    const projectId = await rumbo.projects.create({ ...project, area: "Python" });
    const task = await rumbo.tasks.createFromTitle("Dominio", { projectId });
    expect(task).toMatchObject({ text: "Dominio", projectId, area: "Python" });
  });

  it("lists the tasks of the current module of a roadmap for today", async () => {
    const id = await rumbo.goals.create(goal);
    await rumbo.goals.connect(id!, { kind: "roadmap", name: "Python basics" });
    const module = rumbo.goals.get(id!)!.roadmaps[0]!.current!.name;
    await rumbo.tasks.create({ text: "Hoy", module, scheduled: "2026-10-15" });
    await rumbo.tasks.create({ text: "Mañana", module, scheduled: "2026-10-16" });
    await rumbo.tasks.create({ text: "Otra", scheduled: "2026-10-15" });
    expect(rumbo.goals.get(id!)!.roadmaps[0]!.todayTasks.map(({ text }) => text)).toEqual(["Hoy"]);
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

  it("adds milestones in date order, changes their date and removes them", async () => {
    const id = await rumbo.projects.create(project);
    await rumbo.projects.addMilestone(id!, " Lanzamiento ", "2027-02-01");
    await rumbo.projects.addMilestone(id!, "Sin fecha");
    await rumbo.projects.addMilestone(id!, "Landing", "2026-10-22");
    const titles = () =>
      rumbo.projects.get(id!)!.project.milestones.map((milestone) => milestone.title);
    expect(titles()).toEqual(["Landing", "Lanzamiento", "Sin fecha"]);

    await rumbo.projects.setMilestoneDate(id!, 2, "2026-10-01");
    expect(titles()).toEqual(["Sin fecha", "Landing", "Lanzamiento"]);
    await rumbo.projects.setMilestoneDate(id!, 0, undefined);
    expect(rumbo.projects.get(id!)!.project.milestones[2]).toEqual({
      title: "Sin fecha",
      done: false,
    });

    await rumbo.projects.setMilestone(id!, 0, true);
    expect(rumbo.projects.get(id!)!.nextMilestone?.milestone.title).toBe("Lanzamiento");
    await rumbo.projects.removeMilestone(id!, 0);
    expect(titles()).toEqual(["Lanzamiento", "Sin fecha"]);
  });

  it("lists the dated milestones left across open projects, nearest first", async () => {
    const web = await rumbo.projects.create({
      ...project,
      milestones: [
        { title: "Landing", date: "2026-10-22", done: false },
        { title: "Hecho", date: "2026-10-16", done: true },
      ],
    });
    await rumbo.projects.create({
      ...project,
      title: "Mudanza",
      milestones: [
        { title: "Contrato", date: "2026-10-25", done: false },
        { title: "Sin fecha", done: false },
      ],
    });
    const closed = await rumbo.projects.create({
      ...project,
      title: "Cerrado",
      milestones: [{ title: "Pasado", date: "2026-10-17", done: false }],
    });
    await rumbo.projects.setStatus(closed!, "done");

    const upcoming = rumbo.projects.upcomingMilestones(5);
    expect(upcoming.map((item) => [item.milestone.title, item.daysLeft])).toEqual([
      ["Landing", 7],
      ["Contrato", 10],
    ]);
    expect(upcoming[0]!.projectId).toBe(web);
    expect(rumbo.projects.upcomingMilestones(1)).toHaveLength(1);
  });

  it("changes only what it is given and gives the finished tasks", async () => {
    const id = await rumbo.projects.create({ ...project, area: "Python" }, ["Dominio", "Logo"]);
    await rumbo.projects.update(id!, { outcome: "En producción", deadline: "2027-02-01" });
    const summary = rumbo.projects.get(id!)!;
    expect(summary.project).toMatchObject({
      title: "Web",
      area: "Python",
      outcome: "En producción",
      deadline: "2027-02-01",
    });
    expect(summary.daysLeft).toBe(109);

    await rumbo.tasks.setDone(summary.nextTasks[0]!, true);
    const after = rumbo.projects.get(id!)!;
    expect(after.doneTasks.map((task) => task.text)).toEqual(["Dominio"]);
    expect(after.nextTasks.map((task) => task.text)).toEqual(["Logo"]);
  });

  it("reads the title of the first tasks as natural language", async () => {
    const id = await rumbo.projects.create(project, ["Precios hoy !alta"]);
    const [task] = rumbo.projects.get(id!)!.nextTasks;
    expect(task).toMatchObject({ text: "Precios", scheduled: "2026-10-15", priority: "high" });
  });
});
