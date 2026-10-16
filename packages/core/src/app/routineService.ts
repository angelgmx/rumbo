import type { RoutineRepository } from "../db/routineRepository";
import type { IsoDate } from "../domain/dates";
import type { Habit } from "../domain/habits";
import { linkTarget } from "../domain/links";
import {
  blockTitle,
  isRoutineOn,
  moduleBlockTasks,
  nextRoutineDay,
  routineClashes,
  taskClashes,
  weeklyCompliance,
  routineEnd,
  routineMinutes,
  routineSchema,
  timedBlocks,
  type ModuleWork,
  type Routine,
  type RoutineClash,
  type RoutineBlock,
  type RoutineInput,
  type TaskClash,
  type TimedBlock,
} from "../domain/routines";
import type { Task, TaskDraft } from "../domain/tasks";
import type { DailyService } from "./dailyService";
import type { HabitService, HabitSummary } from "./habitService";
import type { LearningService, ModuleSummary, RoadmapSummary } from "./learningService";
import type { TaskService } from "./taskService";

export interface RoutineSummary {
  id: number;
  title: string;
  routine: Routine;
  blocks: TimedBlock[];
  minutes: number;
  end: string;
  /** Hábitos que cumple: los de sus bloques y los de las rutas que avanza. */
  habits: HabitSummary[];
  /** Cumplimiento de las últimas 4 semanas, de la más antigua a la actual. */
  weeks: number[];
  /** El próximo día que toca, si no es hoy. */
  next?: IsoDate;
}

export interface RoutineStep {
  /** Posición del bloque en la rutina. */
  index: number;
  title: string;
  minutes: number;
  start: string;
  end: string;
  done: boolean;
  /** Se puede marcar a mano: los hábitos de tareas se cumplen terminando sus tareas. */
  completable: boolean;
}

/** Con qué se pisa una rutina: otras rutinas activas y tareas con hora. */
export interface RoutineClashes {
  routines: RoutineClash[];
  tasks: TaskClash[];
}

type StoredRoutine = Pick<RoutineSummary, "id" | "title" | "routine">;

/** Rutinas: el hueco del día que junta hábitos, temas de una ruta y tareas, en orden y con hora. */
export class RoutineService {
  constructor(
    private readonly routines: RoutineRepository,
    private readonly daily: DailyService,
    private readonly habits: HabitService,
    private readonly tasks: TaskService,
    private readonly learning: LearningService,
  ) {}

  /** Todas, por hora de inicio. */
  list(): RoutineSummary[] {
    const stored = this.routines
      .all()
      .map(({ id, routine }) => ({ id, title: routine.title ?? "", routine }));
    // Los hábitos se leen una vez para todas: leerlos por rutina repetiría el cálculo.
    const habits = this.habits.list();
    return stored
      .map((item) => this.summarize(item, habits))
      .sort((a, b) => a.routine.start.localeCompare(b.routine.start));
  }

  get(id: number): RoutineSummary | undefined {
    return this.list().find((summary) => summary.id === id);
  }

  private summarize(item: StoredRoutine, habits: HabitSummary[]): RoutineSummary {
    const { routine } = item;
    const today = this.daily.today();
    const own = this.routineHabits(routine, habits);
    return {
      ...item,
      blocks: timedBlocks(routine),
      minutes: routineMinutes(routine),
      end: routineEnd(routine),
      habits: own,
      weeks: weeklyCompliance(routine, own, today),
      next: isRoutineOn(routine, today) ? undefined : nextRoutineDay(routine, today),
    };
  }

  private routineHabits(routine: Routine, habits: HabitSummary[]): HabitSummary[] {
    const keys = new Set([routine.habit, ...routine.blocks.map((block) => this.habitKeyOf(block))]);
    return habits.filter((summary) => keys.has(summary.habit.key));
  }

  /** El hábito que se cumple con un bloque: el suyo, o el de la ruta del tema. */
  private habitKeyOf(block: RoutineBlock): string | undefined {
    if (block.kind === "habit") return this.habitOf(block.ref)?.key;
    return block.kind === "module" ? this.moduleFor(block)?.roadmap.habit : undefined;
  }

  /** El nombre de un bloque: el suyo, el del hábito o la tarea a la que apunta, o el de su tema. */
  blockName(block: RoutineBlock): string {
    if (block.title) return block.title;
    if (block.kind === "habit") return this.habitOf(block.ref)?.name ?? "Hábito";
    if (block.kind === "task") return this.taskOf(block)?.text ?? "Tarea";
    return this.studyName(block) ?? blockTitle(block);
  }

  /** Un bloque que sigue una ruta se llama como ella; uno que apunta a un tema, como el tema. */
  private studyName(block: RoutineBlock): string | undefined {
    const found = block.kind === "module" ? this.moduleFor(block) : undefined;
    if (!found) return undefined;
    return linkTarget(block.ref) === found.roadmap.name ? found.roadmap.title : found.module.title;
  }

  /** La tarea a la que apunta un bloque, por su id. */
  taskOf(block: RoutineBlock): Task | undefined {
    return block.kind === "task" && block.ref ? this.tasks.get(Number(block.ref)) : undefined;
  }

  /** El hábito de un bloque, por su clave. */
  habitOf(ref: string | undefined): Habit | undefined {
    return this.habits.get(ref);
  }

  /**
   * Los pasos de la rutina que se pueden comprobar: los bloques de hábito, de tema y de tarea,
   * hechos o pendientes según su hábito o su tarea. Las actividades y los descansos no dejan
   * rastro y no salen.
   */
  steps(summary: RoutineSummary): RoutineStep[] {
    return summary.blocks.flatMap((block) => {
      const state = this.stateOf(block, summary);
      if (!state) return [];
      return [
        {
          index: block.index,
          title: this.blockName(block),
          minutes: block.minutes,
          start: block.start,
          end: block.end,
          ...state,
        },
      ];
    });
  }

  private stateOf(
    block: RoutineBlock,
    summary: RoutineSummary,
  ): Pick<RoutineStep, "done" | "completable"> | undefined {
    if (block.kind === "task") {
      const task = this.taskOf(block);
      return task && { done: task.done, completable: !task.done };
    }
    const key = this.habitKeyOf(block);
    const habit = summary.habits.find((candidate) => candidate.habit.key === key);
    return habit && { done: habit.doneToday, completable: habit.habit.kind !== "tasks" };
  }

  /** Las rutinas activas que tocan hoy, por hora de inicio. */
  today(): RoutineSummary[] {
    const today = this.daily.today();
    return this.list().filter((summary) => isRoutineOn(summary.routine, today));
  }

  setActive(id: number, active: boolean): Promise<void> {
    return this.change(id, (routine) => ({ ...routine, active }));
  }

  /** Crea una rutina. Devuelve su id. */
  create(input: RoutineInput): Promise<number | undefined> {
    const routine = routineSchema.parse({ ...input, title: input.title.trim() });
    return this.routines.insert(routine, this.daily.today());
  }

  /** Sustituye la rutina entera (propiedades y bloques). Conserva su tipo. */
  save(id: number, input: RoutineInput): Promise<void> {
    return this.change(id, ({ kind }) =>
      routineSchema.parse({ ...input, kind, title: input.title.trim() }),
    );
  }

  /** Borra la rutina. Lo que ya hiciste (hábitos, tareas) se queda donde está. */
  remove(id: number): Promise<void> {
    return this.routines.remove(id);
  }

  private async change(id: number, apply: (routine: Routine) => Routine): Promise<void> {
    const routine = this.routines.get(id);
    if (routine) await this.routines.save(id, apply(routine));
  }

  /** Con qué se pisa una rutina (aunque aún no esté guardada). `ownId` deja fuera la suya. */
  clashes(routine: Routine, ownId?: number): RoutineClashes {
    const others = this.routines
      .all()
      .filter(({ id }) => id !== ownId)
      .map((other) => ({ title: other.routine.title ?? "", routine: other.routine }));
    return {
      routines: routineClashes(routine, others),
      tasks: taskClashes(routine, this.tasks.all(), this.daily.today()),
    };
  }

  private blockTasks(summary: RoutineSummary, index: number): TaskDraft[] {
    const block = summary.routine.blocks[index];
    if (block?.kind !== "module") return [];
    const work = this.moduleWork(block);
    return work ? moduleBlockTasks(work, block, this.daily.today()) : [];
  }

  /** Crea las tareas de hoy del bloque. Las que ya existen hoy no se repiten. */
  async planBlock(summary: RoutineSummary, index: number): Promise<TaskDraft[]> {
    const today = this.daily.today();
    const existing = new Set(
      this.tasks
        .all()
        .filter((task) => (task.scheduled ?? task.due) === today)
        .map((task) => task.text),
    );
    const created = this.blockTasks(summary, index).filter((draft) => !existing.has(draft.text));
    for (const draft of created) await this.tasks.create(draft);
    return created;
  }

  /**
   * Terminar un bloque: un hábito se apunta hoy, una tarea se marca hecha y un tema sin
   * empezar pasa a «aprendiendo». Las tareas que genera un tema se marcan aparte, una a una.
   */
  async completeBlock(summary: RoutineSummary, index: number): Promise<void> {
    const block = summary.routine.blocks[index];
    if (block?.kind === "habit") await this.completeHabit(block);
    if (block?.kind === "task") await this.completeTask(block);
    if (block?.kind === "module") {
      const module = this.moduleFor(block)?.module;
      if (module?.status === "not-started") await this.learning.setStatus(module, "learning");
    }
  }

  private async completeTask(block: RoutineBlock): Promise<void> {
    const task = this.taskOf(block);
    if (task && !task.done) await this.tasks.setDone(task, true);
  }

  private async completeHabit(block: RoutineBlock): Promise<void> {
    const habit = this.habitOf(block.ref);
    // Los hábitos de tareas se cumplen terminando sus tareas: no se apuntan.
    if (!habit || habit.kind === "tasks") return;

    const today = this.habits.list().find((summary) => summary.habit.key === habit.key);
    const previous = typeof today?.today === "number" ? today.today : 0;
    await this.habits.setValue(
      habit.key,
      valueAfterBlock(habit.kind, previous, block, habit.target),
    );
  }

  private moduleWork(block: RoutineBlock): ModuleWork | undefined {
    const found = this.moduleFor(block);
    if (!found) return undefined;
    const { roadmap, module } = found;
    const resource = module.resources.find((candidate) => candidate.status === "pending");

    return {
      roadmapTitle: roadmap.title,
      moduleTitle: module.title,
      habit: roadmap.habit,
      area: this.habits.get(roadmap.habit)?.area,
      pendingExercises: module.exercises.filter((exercise) => !exercise.done),
      pendingResource: resource && { title: resource.title, minutes: resource.minutes },
    };
  }

  /** El bloque apunta a un tema, o a su ruta y entonces toca el tema en curso. */
  moduleFor(block: RoutineBlock): { roadmap: RoadmapSummary; module: ModuleSummary } | undefined {
    const name = linkTarget(block.ref);
    if (!name) return undefined;
    for (const roadmap of this.learning.roadmaps()) {
      const module: ModuleSummary | undefined =
        roadmap.name === name
          ? roadmap.current
          : roadmap.modules.find((candidate) => candidate.name === name);
      if (module) return { roadmap, module };
    }
    return undefined;
  }
}

/** Un bloque de tiempo suma sus minutos; uno de cantidad da el día por cumplido. */
function valueAfterBlock(
  kind: Habit["kind"],
  previous: number,
  block: RoutineBlock,
  target: number | undefined,
): boolean | number {
  if (kind === "check") return true;
  if (kind === "duration") return previous + block.minutes;
  return Math.max(previous, target ?? 1);
}
