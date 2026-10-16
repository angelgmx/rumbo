import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type Rumbo } from "../src";
import { goalProgress, metricProgress, type Goal } from "../src/domain/goals";
import { projectProgress, type Project } from "../src/domain/projects";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";

const goal: Goal = { title: "B2", why: "", status: "active", obstacle: "", plans: [] };
const project: Project = {
  title: "Web",
  outcome: "Publicada",
  status: "active",
  links: [],
  milestones: [],
  archived: false,
};

describe("goalProgress", () => {
  it("follows the metric when there is one", () => {
    expect(metricProgress({ label: "Sesiones", from: 6, target: 80, current: 43 })).toBe(0.5);
    const measured = { ...goal, metric: { label: "x", from: 0, target: 10, current: 3 } };
    expect(goalProgress(measured, { projects: [1], roadmaps: [], habits: [] })).toBe(0.3);
  });

  it("averages what drives it, and is «sin plan» without anything", () => {
    expect(goalProgress(goal, { projects: [1, 0], roadmaps: [0.5], habits: [0.9, 0.1] })).toBe(0.5);
    expect(goalProgress(goal, { projects: [], roadmaps: [], habits: [] })).toBeUndefined();
    expect(
      goalProgress({ ...goal, status: "done" }, { projects: [], roadmaps: [], habits: [] }),
    ).toBe(1);
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
        title: "Inglés fluido en entrevista",
        why: "Trabajar fuera",
        deadline: "2027-10-14",
        obstacle: "Me da vergüenza",
        plans: [{ if: "lo dejo", then: "reservo 3 clases el domingo" }],
      },
      { projects: [projectId!], habits: ["reading"], roadmaps: ["Python basics"] },
    );

    const summary = rumbo.goals.get(id!)!;
    expect(summary.projects.map((p) => p.project.title)).toEqual(["Entrevista simulada"]);
    expect(summary.habits.map((h) => h.habit.key)).toEqual(["reading"]);
    expect(summary.roadmaps.map((r) => r.title)).toEqual(["Python basics"]);
    expect(summary.goal.plans).toEqual([{ if: "lo dejo", then: "reservo 3 clases el domingo" }]);
    expect(summary.daysLeft).toBe(364);
    expect(summary.progress).toBeGreaterThan(0);
    expect(rumbo.tasks.goalOf({ projectId })).toBe("Inglés fluido en entrevista");
  });

  it("tracks the metric and disconnects what is no longer chosen", async () => {
    const id = await rumbo.goals.create(
      {
        title: "B2",
        why: "",
        obstacle: "",
        plans: [],
        metric: { label: "Sesiones", from: 6, target: 80, unit: "sesiones" },
      },
      { projects: [], habits: ["reading"], roadmaps: [] },
    );
    await rumbo.goals.setCurrent(id!, 43);
    expect(rumbo.goals.get(id!)!.progress).toBe(0.5);

    await rumbo.goals.setDrivers(id!, { projects: [], habits: [], roadmaps: [] });
    expect(rumbo.goals.get(id!)!.habits).toEqual([]);
  });

  it("keeps projects and habits when a goal is removed", async () => {
    const id = await rumbo.goals.create(goal, { projects: [], habits: ["reading"], roadmaps: [] });
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
});
