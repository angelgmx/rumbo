import { systemClock, type Clock, type FileSystem } from "../ports";
import { AgendaService } from "./agendaService";
import { DailyService } from "./dailyService";
import { DayPlanService } from "./dayPlanService";
import { HabitService } from "./habitService";
import { IdeaService } from "./ideaService";
import { LearningService } from "./learningService";
import { ProgressService } from "./progressService";
import { ReviewService } from "./reviewService";
import { RoutineService } from "./routineService";
import { SavedViewService } from "./savedViewService";
import { TaskService } from "./taskService";
import { VaultStore } from "./vaultStore";

export interface Rumbo {
  store: VaultStore;
  daily: DailyService;
  habits: HabitService;
  agenda: AgendaService;
  tasks: TaskService;
  ideas: IdeaService;
  progress: ProgressService;
  views: SavedViewService;
  dayPlan: DayPlanService;
  learning: LearningService;
  review: ReviewService;
  routines: RoutineService;
}

/** Abre un vault y monta todos los servicios de la app sobre él. */
export async function createRumbo(fs: FileSystem, clock: Clock = systemClock): Promise<Rumbo> {
  const store = await VaultStore.open(fs);
  const daily = new DailyService(store, clock);
  const agenda = new AgendaService(store, daily);
  const tasks = new TaskService(store, daily, agenda);
  const habits = new HabitService(store, daily, tasks);
  const learning = new LearningService(store, daily, tasks);

  return {
    store,
    daily,
    agenda,
    habits,
    tasks,
    ideas: new IdeaService(store, daily, tasks),
    progress: new ProgressService(habits, agenda),
    views: new SavedViewService(store),
    dayPlan: new DayPlanService(agenda, habits),
    learning,
    review: new ReviewService(store, learning, daily),
    routines: new RoutineService(store, daily, habits, tasks, learning),
  };
}
