import { ChangeFeed } from "../changeFeed";
import { AppDatabase } from "../db/appDatabase";
import { HabitRepository } from "../db/habitRepository";
import { IdeaRepository } from "../db/ideaRepository";
import { RoutineRepository } from "../db/routineRepository";
import { TaskRepository } from "../db/taskRepository";
import { systemClock, type Clock, type Database, type FileSystem } from "../ports";
import { AgendaService } from "./agendaService";
import { CloseDayService } from "./closeDayService";
import { DailyService } from "./dailyService";
import { DayPlanService } from "./dayPlanService";
import { HabitService } from "./habitService";
import { IdeaService } from "./ideaService";
import { InboxTriageService } from "./inboxTriageService";
import { LearningService } from "./learningService";
import { ProgressService } from "./progressService";
import { RoadmapEditService } from "./roadmapEditService";
import { ReviewService } from "./reviewService";
import { RoutineService } from "./routineService";
import { SavedViewService } from "./savedViewService";
import { TaskService } from "./taskService";
import { VaultImport } from "./vaultImport";
import { VaultStore } from "./vaultStore";

export interface Rumbo {
  /** Avisa de cualquier cambio, en el vault o en la base de datos. */
  changes: ChangeFeed;
  store: VaultStore;
  daily: DailyService;
  habits: HabitService;
  agenda: AgendaService;
  tasks: TaskService;
  ideas: IdeaService;
  triage: InboxTriageService;
  progress: ProgressService;
  views: SavedViewService;
  dayPlan: DayPlanService;
  learning: LearningService;
  review: ReviewService;
  routines: RoutineService;
  closeDay: CloseDayService;
  roadmaps: RoadmapEditService;
}

export interface RumboSources {
  /** El vault: el conocimiento (áreas, temas, rutas, apuntes) y el diario. */
  fs: FileSystem;
  /** La base de datos de la app: lo que organiza tu día. */
  database: Database;
  clock?: Clock;
}

// Aperturas en marcha por base de datos: dos a la vez migrarían e importarían dos veces.
const openings = new WeakMap<Database, Promise<unknown>>();

/**
 * Abre el vault y la base de datos y monta todos los servicios de la app sobre ellos.
 * Si ya se está abriendo la misma base de datos, espera a que termine antes de empezar.
 */
export function createRumbo(sources: RumboSources): Promise<Rumbo> {
  const previous = openings.get(sources.database) ?? Promise.resolve();
  const opening = previous.catch(() => {}).then(() => open(sources));
  openings.set(sources.database, opening);
  return opening;
}

async function open({ fs, database, clock = systemClock }: RumboSources): Promise<Rumbo> {
  const changes = new ChangeFeed();
  const store = await VaultStore.open(fs, changes);
  const db = await AppDatabase.open(database, changes);
  const daily = new DailyService(store, clock);
  const agenda = new AgendaService(store, daily);
  const ideaRepository = new IdeaRepository(db);
  const taskRepository = await TaskRepository.open(db);
  const habitRepository = await HabitRepository.open(db);
  const routineRepository = await RoutineRepository.open(db);
  await new VaultImport(db, store, daily, {
    ideas: ideaRepository,
    tasks: taskRepository,
    habits: habitRepository,
    routines: routineRepository,
  }).run();
  const tasks = new TaskService(taskRepository, store, daily, agenda, habitRepository);
  const habits = new HabitService(habitRepository, daily, tasks);
  const learning = new LearningService(store, daily, tasks, habitRepository);
  const ideas = new IdeaService(ideaRepository, daily, tasks);
  const routines = new RoutineService(routineRepository, daily, habits, tasks, learning);

  return {
    changes,
    store,
    daily,
    agenda,
    habits,
    tasks,
    ideas,
    triage: new InboxTriageService(store, daily, tasks, ideas),
    progress: new ProgressService(habits, agenda),
    views: new SavedViewService(store),
    dayPlan: new DayPlanService(agenda, habits),
    learning,
    review: new ReviewService(store, learning, daily),
    routines,
    closeDay: new CloseDayService(store, daily, habits, tasks, routines),
    roadmaps: new RoadmapEditService(store),
  };
}
