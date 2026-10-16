import type { GoalRepository, StoredGoal } from "../db/goalRepository";
import type { IsoDate } from "../domain/dates";
import {
  daysLeft,
  goalProgress,
  type Goal,
  type GoalInput,
  type GoalStatus,
} from "../domain/goals";
import type { Task } from "../domain/tasks";
import type { Note } from "../vault/vault";
import type { DailyService } from "./dailyService";
import type { HabitService, HabitSummary } from "./habitService";
import type { LearningService, RoadmapSummary } from "./learningService";
import type { ProjectService, ProjectSummary } from "./projectService";
import type { VaultStore } from "./vaultStore";

export interface GoalSummary {
  id: number;
  goal: Goal;
  /** De 0 a 1; sin resultados clave ni nada que lo empuje, `undefined` («sin plan»). */
  progress?: number;
  daysLeft?: number;
  projects: ProjectSummary[];
  /** Las tareas pendientes de sus proyectos, las que tienen fecha primero. */
  tasks: Task[];
  habits: HabitSummary[];
  roadmaps: RoadmapSummary[];
  /** Las notas del vault que lo acompañan. */
  notes: Note[];
}

/** Lo que conecta con un objetivo: proyectos por id, hábitos por clave, rutas y notas por su nota. */
export interface GoalDriverRefs {
  projects: number[];
  habits: string[];
  roadmaps: string[];
  notes: string[];
}

/** Objetivos: con lo que los empuja y su progreso; crearlos, editarlos y conectarlos. */
export class GoalService {
  constructor(
    private readonly store: VaultStore,
    private readonly goals: GoalRepository,
    private readonly projects: ProjectService,
    private readonly habits: HabitService,
    private readonly learning: LearningService,
    private readonly daily: DailyService,
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

  /** Crea el objetivo, activo, y lo conecta con lo que lo empuja. Devuelve su id. */
  async create(input: GoalInput, drivers?: GoalDriverRefs): Promise<number | undefined> {
    const id = await this.goals.insert({ ...input, status: "active" }, this.daily.today());
    if (id !== undefined && drivers) await this.setDrivers(id, drivers);
    return id;
  }

  update(id: number, input: GoalInput): Promise<void> {
    return this.change(id, (goal) => ({ ...goal, ...input }));
  }

  setStatus(id: number, status: GoalStatus): Promise<void> {
    return this.change(id, (goal) => ({ ...goal, status }));
  }

  /** Apunta dónde va un resultado clave. */
  setCurrent(id: number, index: number, current: number): Promise<void> {
    return this.change(id, (goal) => ({
      ...goal,
      keyResults: goal.keyResults.map((keyResult, i) =>
        i === index ? { ...keyResult, current } : keyResult,
      ),
    }));
  }

  /** Lo borra. Sus proyectos y hábitos se quedan, sin objetivo. */
  remove(id: number): Promise<void> {
    return this.goals.remove(id);
  }

  /**
   * Conecta el objetivo con lo elegido y desconecta lo que ya no está elegido. Cada proyecto
   * y cada hábito tiene un solo objetivo: elegirlo aquí lo quita del que tuviera.
   */
  async setDrivers(id: number, drivers: GoalDriverRefs): Promise<void> {
    const current = this.goals.get(id);
    if (!current) return;

    for (const { id: projectId, project } of this.projects.list()) {
      const wanted = drivers.projects.includes(projectId);
      if (wanted !== (project.goalId === id)) {
        await this.projects.setGoal(projectId, wanted ? id : undefined);
      }
    }
    for (const { habit } of this.habits.list()) {
      const wanted = drivers.habits.includes(habit.key);
      if (wanted !== (habit.goalId === id)) {
        await this.habits.setGoal(habit.key, wanted ? id : undefined);
      }
    }
    const wanted = [...drivers.roadmaps, ...drivers.notes];
    for (const note of [...current.roadmaps, ...current.notes]) {
      if (!wanted.includes(note)) await this.goals.unlink(id, note);
    }
    for (const roadmap of drivers.roadmaps) await this.goals.link(id, roadmap, "roadmap");
    for (const note of drivers.notes) await this.goals.link(id, note, "note");
  }

  private async change(id: number, apply: (goal: Goal) => Goal): Promise<void> {
    const stored = this.goals.get(id);
    if (stored) await this.goals.save(id, apply(stored.goal));
  }

  private summarize(
    { id, goal, roadmaps: roadmapNames, notes }: StoredGoal,
    all: { projects: ProjectSummary[]; habits: HabitSummary[]; roadmaps: RoadmapSummary[] },
  ): GoalSummary {
    const projects = all.projects.filter(({ project }) => project.goalId === id);
    const habits = all.habits.filter(({ habit }) => habit.goalId === id);
    const roadmaps = all.roadmaps.filter((roadmap) => roadmapNames.includes(roadmap.name));
    const today: IsoDate = this.daily.today();
    return {
      id,
      goal,
      progress: goalProgress(goal, {
        projects: projects.map((project) => project.progress),
        roadmaps: roadmaps.map((roadmap) =>
          roadmap.modules.length === 0 ? 0 : roadmap.mastered / roadmap.modules.length,
        ),
        habits: habits.map((habit) => habit.last30Days),
      }),
      daysLeft: daysLeft(goal, today),
      projects,
      tasks: projects.flatMap((project) => project.nextTasks).sort(byDate),
      habits,
      roadmaps,
      notes: notes.flatMap((name) => this.store.findByName(name) ?? []),
    };
  }
}

function byDate(a: Task, b: Task): number {
  return (a.scheduled ?? a.due ?? "9999").localeCompare(b.scheduled ?? b.due ?? "9999");
}

function byDeadline(a: GoalSummary, b: GoalSummary): number {
  return (a.goal.deadline ?? "9999").localeCompare(b.goal.deadline ?? "9999");
}
