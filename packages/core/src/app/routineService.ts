import type { RoutineRepository } from "../db/routineRepository";
import type { IsoDate } from "../domain/dates";
import type { Habit, HabitSchedule } from "../domain/habits";
import { linkTarget } from "../domain/links";
import {
  blockTitle,
  insertBlock,
  isRoutineOn,
  moduleBlockTasks,
  moveBlock,
  nextRoutineDay,
  removeBlock,
  routineClashes,
  updateBlock,
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
  type TimedBlock,
} from "../domain/routines";
import type { TaskDraft } from "../domain/tasks";
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
  /** Otras rutinas con las que se pisa en hora. */
  clashes: RoutineClash[];
}

export interface RoutineStep {
  /** Posición del bloque en la rutina. */
  index: number;
  title: string;
  minutes: number;
  start: string;
  end: string;
  done: boolean;
  habit: HabitSummary;
}

/** Lo que se puede cambiar de una rutina sin tocar sus bloques. */
interface RoutineChanges {
  title?: string;
  start?: string;
  days?: HabitSchedule;
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
      .map((item) => this.summarize(item, stored, habits))
      .sort((a, b) => a.routine.start.localeCompare(b.routine.start));
  }

  get(id: number): RoutineSummary | undefined {
    return this.list().find((summary) => summary.id === id);
  }

  private summarize(
    item: StoredRoutine,
    all: StoredRoutine[],
    habits: HabitSummary[],
  ): RoutineSummary {
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
      clashes: routineClashes(
        routine,
        all.filter((other) => other.id !== item.id),
      ),
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

  /** El nombre de un bloque: el suyo, el del hábito que marca o el de la nota a la que apunta. */
  blockName(block: RoutineBlock): string {
    if (block.title || block.kind !== "habit") return blockTitle(block);
    return this.habitOf(block.ref)?.name ?? "Hábito";
  }

  /** El hábito de un bloque, por su clave. */
  habitOf(ref: string | undefined): Habit | undefined {
    return this.habits.get(ref);
  }

  /**
   * Los pasos de la rutina que se pueden comprobar: los bloques ligados a un hábito, hechos o
   * pendientes según ese hábito. Los libres y los descansos no dejan rastro y no salen.
   */
  steps(summary: RoutineSummary): RoutineStep[] {
    return summary.blocks.flatMap((block) => {
      const key = this.habitKeyOf(block);
      const habit = summary.habits.find((candidate) => candidate.habit.key === key);
      if (!habit) return [];
      return [
        {
          index: block.index,
          title: this.blockName(block),
          minutes: block.minutes,
          start: block.start,
          end: block.end,
          done: habit.doneToday,
          habit,
        },
      ];
    });
  }

  /** Las rutinas activas que tocan hoy, por hora de inicio. */
  today(): RoutineSummary[] {
    const today = this.daily.today();
    return this.list().filter((summary) => isRoutineOn(summary.routine, today));
  }

  setActive(id: number, active: boolean): Promise<void> {
    return this.change(id, (routine) => ({ ...routine, active }));
  }

  /** Cambia el nombre, la hora o los días. Las horas de los bloques se recalculan solas. */
  update(id: number, changes: RoutineChanges): Promise<void> {
    return this.change(id, (routine) => ({ ...routine, ...withoutEmptyFields(changes) }));
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

  /** Cambia un bloque de sitio. */
  moveBlock(id: number, from: number, to: number): Promise<void> {
    return this.editBlocks(id, (blocks) => moveBlock(blocks, from, to));
  }

  /** Añade un bloque en una posición; sin posición, al final. */
  addBlock(id: number, block: RoutineBlock, at?: number): Promise<void> {
    return this.editBlocks(id, (blocks) => insertBlock(blocks, withoutEmptyFields(block), at));
  }

  removeBlock(id: number, index: number): Promise<void> {
    return this.editBlocks(id, (blocks) => removeBlock(blocks, index));
  }

  /** Cambia los minutos o el título de un bloque. */
  updateBlock(
    id: number,
    index: number,
    changes: Partial<Pick<RoutineBlock, "minutes" | "title">>,
  ): Promise<void> {
    return this.editBlocks(id, (blocks) => updateBlock<RoutineBlock>(blocks, index, changes));
  }

  private editBlocks(id: number, edit: (blocks: RoutineBlock[]) => RoutineBlock[]): Promise<void> {
    return this.change(id, (routine) => ({ ...routine, blocks: edit(routine.blocks) }));
  }

  private async change(id: number, apply: (routine: Routine) => Routine): Promise<void> {
    const routine = this.routines.get(id);
    if (routine) await this.routines.save(id, apply(routine));
  }

  /** Las tareas que generaría hoy un bloque de un tema (para enseñarlas antes de crearlas). */
  blockTasks(summary: RoutineSummary, index: number): TaskDraft[] {
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
   * Terminar un bloque: si es un hábito, se apunta hoy; si es un tema
   * sin empezar, pasa a «aprendiendo». Las tareas se marcan aparte, una a una.
   */
  async completeBlock(summary: RoutineSummary, index: number): Promise<void> {
    const block = summary.routine.blocks[index];
    if (block?.kind === "habit") await this.completeHabit(block);
    if (block?.kind === "module") {
      const module = this.moduleFor(block)?.module;
      if (module?.status === "not-started") await this.learning.setStatus(module, "learning");
    }
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

function withoutEmptyFields<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as T;
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
