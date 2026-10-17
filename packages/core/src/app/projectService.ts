import type { GoalRepository } from "../db/goalRepository";
import type { ProjectRepository } from "../db/projectRepository";
import { daysBetween, type IsoDate } from "../domain/dates";
import type { GoalPace } from "../domain/goals";
import {
  nextMilestone,
  projectPace,
  projectProgress,
  projectSteps,
  sortMilestones,
  type Milestone,
  type Project,
  type ProjectInput,
  type ProjectStatus,
} from "../domain/projects";
import type { Task } from "../domain/tasks";
import type { DailyService } from "./dailyService";
import type { TaskService } from "./taskService";

export interface ProjectSummary {
  id: number;
  project: Project;
  /** De 0 a 1, por sus hitos o sus tareas. */
  progress: number;
  /** Sus tareas sin terminar, las que tienen fecha primero. */
  nextTasks: Task[];
  doneTasks: Task[];
  /** El primer hito sin hacer, con su posición en `project.milestones`. */
  nextMilestone?: { index: number; milestone: Milestone };
  /** Su ritmo frente a la fecha límite; sin pasos que medir, nada. */
  pace?: GoalPace;
  /** Días hasta la fecha límite; negativo si ya pasó. */
  daysLeft?: number;
  /** Los hitos hechos y los que hay; sin hitos, las tareas. */
  steps: { done: number; total: number };
  goal?: { id: number; title: string };
}

export interface UpcomingMilestone {
  projectId: number;
  project: Project;
  milestone: Milestone;
  daysLeft: number;
}

/** Proyectos: lo que construyes, con su resultado, hitos, enlaces y tareas. */
export class ProjectService {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly tasks: TaskService,
    private readonly daily: DailyService,
    private readonly goals: GoalRepository,
  ) {}

  /** Los que no están archivados, por título. */
  list(): ProjectSummary[] {
    return this.projects
      .all()
      .filter(({ project }) => !project.archived)
      .map(({ id, project }) => this.summarize(id, project))
      .sort((a, b) => a.project.title.localeCompare(b.project.title));
  }

  get(id: number): ProjectSummary | undefined {
    const project = this.projects.get(id);
    return project && this.summarize(id, project);
  }

  /** Los hitos con fecha que quedan por hacer en los proyectos abiertos, los más cercanos primero. */
  upcomingMilestones(limit: number): UpcomingMilestone[] {
    const today = this.daily.today();
    return this.projects
      .all()
      .filter(({ project }) => !project.archived && project.status !== "done")
      .flatMap(({ id, project }) =>
        project.milestones.flatMap((milestone) =>
          !milestone.done && milestone.date
            ? [
                {
                  projectId: id,
                  project,
                  milestone,
                  daysLeft: daysBetween(today, milestone.date),
                },
              ]
            : [],
        ),
      )
      .sort((a, b) => a.milestone.date!.localeCompare(b.milestone.date!))
      .slice(0, limit);
  }

  /** Crea el proyecto con sus primeras tareas. Devuelve su id. */
  async create(input: ProjectInput, firstTasks: string[] = []): Promise<number | undefined> {
    const id = await this.projects.insert(
      {
        ...input,
        milestones: sortMilestones(input.milestones),
        start: input.start ?? this.daily.today(),
        archived: false,
      },
      this.daily.today(),
    );
    if (id === undefined) return undefined;
    for (const text of firstTasks.filter((task) => task.trim())) {
      await this.tasks.createFromTitle(text, { projectId: id, area: input.area });
    }
    return id;
  }

  /** Cambia solo lo que se da; el estado va por `setStatus`, que apunta cuándo se termina. */
  update(id: number, changes: Partial<Omit<ProjectInput, "status">>): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      ...changes,
      milestones: sortMilestones(changes.milestones ?? project.milestones),
    }));
  }

  /** Al terminarlo se apunta el día; si vuelve a abrirse, se quita. */
  setStatus(id: number, status: ProjectStatus): Promise<void> {
    const finished = status === "done" ? this.daily.today() : undefined;
    return this.change(id, (project) => ({ ...project, status, finished }));
  }

  setGoal(id: number, goalId: number | undefined): Promise<void> {
    return this.change(id, (project) => ({ ...project, goalId }));
  }

  setMilestone(id: number, index: number, done: boolean): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      milestones: project.milestones.map((milestone, i) =>
        i === index ? { ...milestone, done } : milestone,
      ),
    }));
  }

  /** Suma un hito; queda en su sitio según su fecha. */
  addMilestone(id: number, title: string, date?: IsoDate): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      milestones: sortMilestones([
        ...project.milestones,
        { title: title.trim(), ...(date && { date }), done: false },
      ]),
    }));
  }

  setMilestoneDate(id: number, index: number, date: IsoDate | undefined): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      milestones: sortMilestones(
        project.milestones.map((milestone, i) =>
          i === index
            ? { title: milestone.title, done: milestone.done, ...(date && { date }) }
            : milestone,
        ),
      ),
    }));
  }

  removeMilestone(id: number, index: number): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      milestones: project.milestones.filter((_, i) => i !== index),
    }));
  }

  /** Lo quita de la vista sin borrar nada. */
  archive(id: number): Promise<void> {
    return this.change(id, (project) => ({ ...project, archived: true }));
  }

  /** Lo borra. Sus tareas se quedan, sin proyecto. */
  remove(id: number): Promise<void> {
    return this.projects.remove(id);
  }

  private async change(id: number, apply: (project: Project) => Project): Promise<void> {
    const project = this.projects.get(id);
    if (project) await this.projects.save(id, apply(project));
  }

  private summarize(id: number, project: Project): ProjectSummary {
    const tasks = this.tasks.forProject(id);
    const goal = this.goals.get(project.goalId);
    const today = this.daily.today();
    const progress = projectProgress(project, tasks);
    const steps = projectSteps(project, tasks);
    return {
      id,
      project,
      progress,
      nextTasks: tasks.filter((task) => !task.done).sort(byDate),
      doneTasks: tasks.filter((task) => task.done),
      nextMilestone: nextMilestone(project),
      pace: steps.total > 0 ? projectPace(project, progress, today) : undefined,
      daysLeft: project.deadline ? daysBetween(today, project.deadline) : undefined,
      steps,
      goal: goal && { id: goal.id, title: goal.goal.title },
    };
  }
}

function byDate(a: Task, b: Task): number {
  const left = a.scheduled ?? a.due ?? "9999";
  const right = b.scheduled ?? b.due ?? "9999";
  return left.localeCompare(right);
}
