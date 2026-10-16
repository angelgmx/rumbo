import type { GoalRepository, StoredGoal } from "../db/goalRepository";
import type { IsoDate } from "../domain/dates";
import {
  daysLeft,
  goalProgress,
  goalPace,
  type Goal,
  type GoalInput,
  type GoalPace,
  type GoalStatus,
  type KeyResult,
} from "../domain/goals";
import type { Resource } from "../domain/resources";
import { nearestMilestone, type UpcomingMilestone } from "../domain/projects";
import type { Task } from "../domain/tasks";
import type { Note } from "../vault/vault";
import type { DailyService } from "./dailyService";
import type { HabitService, HabitSummary } from "./habitService";
import type { LearningService, RoadmapSummary } from "./learningService";
import type { ProjectService, ProjectSummary } from "./projectService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

export interface GoalSummary {
  id: number;
  goal: Goal;
  /** De 0 a 1; sin resultados clave ni nada que lo empuje, `undefined` («sin plan»). */
  progress?: number;
  daysLeft?: number;
  /** Ritmo real frente al necesario; solo en un objetivo en marcha, con fecha límite y sin terminar. */
  pace?: GoalPace;
  /** El hito sin hacer con fecha más cercano de sus proyectos. */
  milestone?: UpcomingMilestone;
  projects: ProjectSummary[];
  /** Sus tareas pendientes, propias y de sus proyectos, las que tienen fecha primero. */
  tasks: Task[];
  habits: HabitSummary[];
  roadmaps: RoadmapSummary[];
  /** Las notas del vault que lo acompañan. */
  notes: Note[];
}

/**
 * Una cosa que se conecta a un objetivo: un proyecto o una tarea por id, un hábito por clave,
 * una ruta o una nota por nombre y un recurso por su dirección (o su título, si no tiene).
 */
export type GoalLink =
  | { kind: "project"; id: number }
  | { kind: "task"; id: number }
  | { kind: "habit"; key: string }
  | { kind: "roadmap"; name: string }
  | { kind: "note"; name: string }
  | { kind: "resource"; resource: Resource };

/** Lo que se conecta al crear un objetivo: proyectos por id, hábitos por clave, rutas y notas por su nota. */
export interface GoalDriverRefs {
  projects: number[];
  habits: string[];
  roadmaps: string[];
  notes: string[];
}

/** Objetivos: con lo que los empuja y su progreso; crearlos, editarlos y conectarlos uno a uno. */
export class GoalService {
  constructor(
    private readonly store: VaultStore,
    private readonly goals: GoalRepository,
    private readonly projects: ProjectService,
    private readonly habits: HabitService,
    private readonly learning: LearningService,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
  ) {}

  /** Todos, los que vencen antes primero; los que no tienen fecha, al final. */
  list(): GoalSummary[] {
    const projects = this.projects.list();
    const habits = this.habits.list();
    const roadmaps = this.learning.roadmaps();
    return this.goals
      .all()
      .map((stored) => this.summarize(stored, { projects, habits, roadmaps }))
      .sort(byDeadline);
  }

  get(id: number): GoalSummary | undefined {
    return this.list().find((summary) => summary.id === id);
  }

  /** Crea el objetivo, activo y empezado hoy si no dice otra cosa, y lo conecta. Devuelve su id. */
  async create(input: GoalInput, drivers?: GoalDriverRefs): Promise<number | undefined> {
    const today = this.daily.today();
    const id = await this.goals.insert(
      { ...input, start: input.start ?? today, status: "active" },
      today,
    );
    if (id === undefined || !drivers) return id;

    for (const project of drivers.projects)
      await this.connect(id, { kind: "project", id: project });
    for (const key of drivers.habits) await this.connect(id, { kind: "habit", key });
    for (const name of drivers.roadmaps) await this.connect(id, { kind: "roadmap", name });
    for (const name of drivers.notes) await this.connect(id, { kind: "note", name });
    return id;
  }

  /** Cambia lo que se pase; el resto del objetivo se queda como estaba. */
  update(id: number, input: Partial<GoalInput>): Promise<void> {
    return this.change(id, (goal) => ({ ...goal, ...input }));
  }

  setStatus(id: number, status: GoalStatus): Promise<void> {
    return this.change(id, (goal) => ({ ...goal, status }));
  }

  addKeyResult(id: number, keyResult: KeyResult): Promise<void> {
    return this.change(id, (goal) => ({
      ...goal,
      keyResults: [...goal.keyResults, keyResult],
    }));
  }

  /** Cambia un resultado clave; para apuntar dónde vas, `current`. */
  changeKeyResult(id: number, index: number, changes: Partial<KeyResult>): Promise<void> {
    return this.change(id, (goal) => ({
      ...goal,
      keyResults: goal.keyResults.map((keyResult, i) =>
        i === index ? { ...keyResult, ...changes } : keyResult,
      ),
    }));
  }

  removeKeyResult(id: number, index: number): Promise<void> {
    return this.change(id, (goal) => ({
      ...goal,
      keyResults: goal.keyResults.filter((_, i) => i !== index),
    }));
  }

  /** Lo borra. Sus proyectos y hábitos se quedan, sin objetivo. */
  remove(id: number): Promise<void> {
    return this.goals.remove(id);
  }

  /**
   * Conecta algo con el objetivo. Un proyecto, un hábito o una tarea empuja un solo objetivo:
   * conectarlo aquí lo quita del que tuviera.
   */
  async connect(id: number, link: GoalLink): Promise<void> {
    await this.setLink(id, link, id);
  }

  async disconnect(id: number, link: GoalLink): Promise<void> {
    await this.setLink(id, link, undefined);
  }

  private async change(id: number, apply: (goal: Goal) => Goal): Promise<void> {
    const stored = this.goals.get(id);
    if (stored) await this.goals.save(id, apply(stored.goal));
  }

  private async setLink(id: number, link: GoalLink, goalId: number | undefined): Promise<void> {
    switch (link.kind) {
      case "project":
        return this.projects.setGoal(link.id, goalId);
      case "habit":
        return this.habits.setGoal(link.key, goalId);
      case "task": {
        const task = this.tasks.get(link.id);
        return task && this.tasks.update(task, { goalId });
      }
      case "roadmap":
      case "note":
        return goalId === undefined
          ? this.goals.unlink(id, link.name)
          : this.goals.link(id, link.name, link.kind);
      case "resource":
        return this.change(id, (goal) => ({
          ...goal,
          resources: withResource(goal.resources, link.resource, goalId !== undefined),
        }));
    }
  }

  private summarize(
    { id, goal, roadmaps: roadmapNames, notes }: StoredGoal,
    all: {
      projects: ProjectSummary[];
      habits: HabitSummary[];
      roadmaps: RoadmapSummary[];
    },
  ): GoalSummary {
    const projects = all.projects.filter(({ project }) => project.goalId === id);
    const habits = all.habits.filter(({ habit }) => habit.goalId === id);
    const roadmaps = all.roadmaps.filter((roadmap) => roadmapNames.includes(roadmap.name));
    const today: IsoDate = this.daily.today();
    const progress = goalProgress(goal, {
      projects: projects.map((project) => project.progress),
      roadmaps: roadmaps.map((roadmap) =>
        roadmap.modules.length === 0 ? 0 : roadmap.mastered / roadmap.modules.length,
      ),
      habits: habits.map((habit) => habit.last30Days),
    });
    return {
      id,
      goal,
      progress,
      daysLeft: daysLeft(goal, today),
      pace: goalPace(goal, progress, today),
      milestone: nearestMilestone(projects.map((summary) => summary.project)),
      projects,
      tasks: [
        ...this.tasks.forGoal(id).filter((task) => !task.done),
        ...projects.flatMap((project) => project.nextTasks),
      ].sort(byDate),
      habits,
      roadmaps,
      notes: notes.flatMap((name) => this.store.findByName(name) ?? []),
    };
  }
}

const sameResource = (a: Resource, b: Resource) => (a.url ?? a.title) === (b.url ?? b.title);

function withResource(resources: Resource[], resource: Resource, present: boolean): Resource[] {
  const linked = resources.some((other) => sameResource(other, resource));
  if (!present) return resources.filter((other) => !sameResource(other, resource));
  return linked ? resources : [...resources, resource];
}

function byDate(a: Task, b: Task): number {
  return (a.scheduled ?? a.due ?? "9999").localeCompare(b.scheduled ?? b.due ?? "9999");
}

function byDeadline(a: GoalSummary, b: GoalSummary): number {
  return (a.goal.deadline ?? "9999").localeCompare(b.goal.deadline ?? "9999");
}
