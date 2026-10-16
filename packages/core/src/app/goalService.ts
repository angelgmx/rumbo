import type { GoalRepository } from "../db/goalRepository";
import type { IsoDate } from "../domain/dates";
import {
  daysLeft,
  goalProgress,
  type Goal,
  type GoalInput,
  type GoalStatus,
} from "../domain/goals";
import type { DailyService } from "./dailyService";
import type { HabitService, HabitSummary } from "./habitService";
import type { LearningService, RoadmapSummary } from "./learningService";
import type { ProjectService, ProjectSummary } from "./projectService";

export interface GoalSummary {
  id: number;
  goal: Goal;
  /** De 0 a 1; sin métrica ni nada que lo empuje, `undefined` («sin plan»). */
  progress?: number;
  daysLeft?: number;
  projects: ProjectSummary[];
  habits: HabitSummary[];
  roadmaps: RoadmapSummary[];
}

/** Lo que empuja un objetivo: proyectos por id, hábitos por clave y rutas por su nota. */
export interface GoalDriverRefs {
  projects: number[];
  habits: string[];
  roadmaps: string[];
}

/** Objetivos: con lo que los empuja y su progreso; crearlos, editarlos y conectarlos. */
export class GoalService {
  constructor(
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
      .map((stored) =>
        this.summarize(stored.id, stored.goal, stored.roadmaps, {
          projects,
          habits,
          roadmaps,
        }),
      )
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

  /** Apunta dónde va la métrica. */
  setCurrent(id: number, current: number): Promise<void> {
    return this.change(id, (goal) =>
      goal.metric ? { ...goal, metric: { ...goal.metric, current } } : goal,
    );
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
    for (const roadmap of current.roadmaps.filter((name) => !drivers.roadmaps.includes(name))) {
      await this.goals.removeRoadmap(id, roadmap);
    }
    for (const roadmap of drivers.roadmaps) await this.goals.addRoadmap(id, roadmap);
  }

  private async change(id: number, apply: (goal: Goal) => Goal): Promise<void> {
    const stored = this.goals.get(id);
    if (stored) await this.goals.save(id, apply(stored.goal));
  }

  private summarize(
    id: number,
    goal: Goal,
    roadmapNames: string[],
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
      habits,
      roadmaps,
    };
  }
}

function byDeadline(a: GoalSummary, b: GoalSummary): number {
  return (a.goal.deadline ?? "9999").localeCompare(b.goal.deadline ?? "9999");
}
