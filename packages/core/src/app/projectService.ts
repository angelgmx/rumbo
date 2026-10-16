import type { GoalRepository } from "../db/goalRepository";
import type { ProjectRepository } from "../db/projectRepository";
import {
  projectProgress,
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
  doneTasks: number;
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
      { ...input, start: input.start ?? this.daily.today(), archived: false },
      this.daily.today(),
    );
    if (id === undefined) return undefined;
    for (const text of firstTasks.filter((task) => task.trim())) {
      await this.tasks.create({ text, projectId: id, area: input.area });
    }
    return id;
  }

  update(id: number, input: ProjectInput): Promise<void> {
    return this.change(id, (project) => ({ ...project, ...input }));
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
    return {
      id,
      project,
      progress: projectProgress(project, tasks),
      nextTasks: tasks.filter((task) => !task.done).sort(byDate),
      doneTasks: tasks.filter((task) => task.done).length,
      goal: goal && { id: goal.id, title: goal.goal.title },
    };
  }
}

function byDate(a: Task, b: Task): number {
  const left = a.scheduled ?? a.due ?? "9999";
  const right = b.scheduled ?? b.due ?? "9999";
  return left.localeCompare(right);
}
