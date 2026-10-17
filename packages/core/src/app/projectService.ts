import type { GoalRepository } from "../db/goalRepository";
import type { ProjectRepository } from "../db/projectRepository";
import { daysBetween, type IsoDate } from "../domain/dates";
import type { GoalPace } from "../domain/goals";
import {
  nextMilestone,
  projectPace,
  projectProgress,
  projectSteps,
  sameLink,
  sortMilestones,
  timeElapsed,
  upcomingEntries,
  type Milestone,
  type NewMilestone,
  type Project,
  type ProjectInput,
  type ProjectLink,
  type ProjectStatus,
  type UpcomingEntry,
} from "../domain/projects";
import type { Task } from "../domain/tasks";
import type { DailyService } from "./dailyService";
import type { TaskService } from "./taskService";

/** Lo que se enseña en «Lo próximo» de un proyecto. */
const UPCOMING_SHOWN = 4;

export interface StepCount {
  done: number;
  total: number;
}

export interface ProjectSummary {
  id: number;
  project: Project;
  /** De 0 a 1, por sus hitos o sus tareas. */
  progress: number;
  /** Sus tareas sin terminar, las que tienen fecha primero. */
  nextTasks: Task[];
  doneTasks: Task[];
  /** El primer hito sin hacer según el orden por fecha. */
  nextMilestone?: Milestone;
  /** Las tareas hechas y las que hay de cada hito, por el id del hito. */
  milestoneTasks: Record<number, StepCount>;
  /** Lo siguiente con fecha: tareas e hitos, lo más cercano primero. */
  upcoming: UpcomingEntry[];
  /** De 0 a 1, lo que ha pasado del tiempo entre su inicio y su fecha límite. */
  timeElapsed?: number;
  /** Su ritmo frente a la fecha límite; sin pasos que medir, nada. */
  pace?: GoalPace;
  /** Días hasta la fecha límite; negativo si ya pasó. */
  daysLeft?: number;
  /** Los hitos hechos y los que hay; sin hitos, las tareas. */
  steps: StepCount;
  goal?: { id: number; title: string };
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

  /** Crea el proyecto con sus primeras tareas. Devuelve su id. */
  async create(input: ProjectInput, firstTasks: string[] = []): Promise<number | undefined> {
    const id = await this.projects.insert(
      {
        ...input,
        milestones: newMilestones(input.milestones),
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
  update(id: number, changes: Partial<Omit<ProjectInput, "status" | "milestones">>): Promise<void> {
    return this.change(id, (project) => ({ ...project, ...changes }));
  }

  /** Al terminarlo se apunta el día; si vuelve a abrirse, se quita. */
  setStatus(id: number, status: ProjectStatus): Promise<void> {
    const finished = status === "done" ? this.daily.today() : undefined;
    return this.change(id, (project) => ({ ...project, status, finished }));
  }

  setGoal(id: number, goalId: number | undefined): Promise<void> {
    return this.change(id, (project) => ({ ...project, goalId }));
  }

  setMilestone(id: number, milestoneId: number, done: boolean): Promise<void> {
    return this.changeMilestone(id, milestoneId, (milestone) => ({ ...milestone, done }));
  }

  /** Suma un hito; queda en su sitio según su fecha. */
  addMilestone(id: number, title: string, date?: IsoDate): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      milestones: sortMilestones([
        ...project.milestones,
        {
          id: Math.max(0, ...project.milestones.map((milestone) => milestone.id)) + 1,
          title: title.trim(),
          ...(date && { date }),
          done: false,
        },
      ]),
    }));
  }

  renameMilestone(id: number, milestoneId: number, title: string): Promise<void> {
    return this.changeMilestone(id, milestoneId, (milestone) => ({
      ...milestone,
      title: title.trim(),
    }));
  }

  setMilestoneDate(id: number, milestoneId: number, date: IsoDate | undefined): Promise<void> {
    return this.changeMilestone(id, milestoneId, (milestone) => ({
      id: milestone.id,
      title: milestone.title,
      done: milestone.done,
      ...(date && { date }),
    }));
  }

  /** Quita el hito; sus tareas se quedan en el proyecto, sin hito. */
  async removeMilestone(id: number, milestoneId: number): Promise<void> {
    await this.change(id, (project) => ({
      ...project,
      milestones: project.milestones.filter((milestone) => milestone.id !== milestoneId),
    }));
    for (const task of this.tasks.forProject(id)) {
      if (task.milestoneId === milestoneId) {
        await this.tasks.update(task, { milestoneId: undefined });
      }
    }
  }

  /** Suma un enlace; si ya está, no lo repite. */
  addLink(id: number, link: ProjectLink): Promise<void> {
    return this.change(id, (project) =>
      project.links.some((existing) => sameLink(existing, link))
        ? project
        : { ...project, links: [...project.links, link] },
    );
  }

  removeLink(id: number, index: number): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      links: project.links.filter((_, i) => i !== index),
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

  /** Cambia solo el hito con ese id; al cambiar su fecha, el orden se recoloca. */
  private changeMilestone(
    id: number,
    milestoneId: number,
    apply: (milestone: Milestone) => Milestone,
  ): Promise<void> {
    return this.change(id, (project) => ({
      ...project,
      milestones: sortMilestones(
        project.milestones.map((milestone) =>
          milestone.id === milestoneId ? apply(milestone) : milestone,
        ),
      ),
    }));
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
      milestoneTasks: milestoneTasks(project, tasks),
      upcoming: upcomingEntries(tasks, project.milestones, UPCOMING_SHOWN),
      timeElapsed: timeElapsed(project, today),
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

/** Da a los hitos nuevos su id, de 1 en adelante, en el orden por fecha. */
function newMilestones(milestones: NewMilestone[]): Milestone[] {
  return sortMilestones(milestones).map(({ title, date }, index) => ({
    id: index + 1,
    title: title.trim(),
    ...(date && { date }),
    done: false,
  }));
}

function milestoneTasks(project: Project, tasks: Task[]): Record<number, StepCount> {
  return Object.fromEntries(
    project.milestones.map(({ id }) => {
      const own = tasks.filter((task) => task.milestoneId === id);
      return [id, { done: own.filter((task) => task.done).length, total: own.length }];
    }),
  );
}
