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
  ROUTINE_TEMPLATES,
  routineEnd,
  routineMinutes,
  routineSchema,
  timedBlocks,
  type ModuleWork,
  type Routine,
  type RoutineClash,
  type RoutineBlock,
  type RoutineInput,
  type RoutineTemplate,
  type TimedBlock,
} from "../domain/routines";
import type { TaskDraft } from "../domain/tasks";
import { newNoteSource, setFrontmatter } from "../vault/frontmatter";
import type { DailyService } from "./dailyService";
import type { HabitService, HabitSummary } from "./habitService";
import type { LearningService, ModuleSummary, RoadmapSummary } from "./learningService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

export interface RoutineSummary {
  path: string;
  name: string;
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

interface RoutineList {
  routines: RoutineSummary[];
  /** Notas de rutina con el frontmatter mal escrito, para avisar al usuario. */
  invalid: string[];
}

/** Lo que se puede cambiar de una rutina sin tocar sus bloques. */
interface RoutineChanges {
  title?: string;
  start?: string;
  days?: HabitSchedule;
}

type ParsedRoutine = Pick<RoutineSummary, "path" | "name" | "title" | "routine">;

/** Rutinas: el hueco del día que junta hábitos, temas de una ruta y tareas, en orden y con hora. */
export class RoutineService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly habits: HabitService,
    private readonly tasks: TaskService,
    private readonly learning: LearningService,
  ) {}

  list(): RoutineList {
    const parsed: ParsedRoutine[] = [];
    const invalid: string[] = [];
    for (const note of this.store.notesOfType("routine")) {
      const result = routineSchema.safeParse(note.data);
      if (!result.success) {
        invalid.push(note.path);
        continue;
      }
      const routine = result.data;
      parsed.push({ path: note.path, name: note.name, title: routine.title ?? note.name, routine });
    }

    // Los hábitos se leen una vez para todas: leerlos por rutina recorre las dailies de nuevo.
    const habits = this.habits.list();
    const routines = parsed
      .map((item) => this.summarize(item, parsed, habits))
      .sort((a, b) => a.routine.start.localeCompare(b.routine.start));
    return { routines, invalid };
  }

  private summarize(
    item: ParsedRoutine,
    all: ParsedRoutine[],
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
        all.filter((other) => other.path !== item.path),
      ),
    };
  }

  private routineHabits(routine: Routine, habits: HabitSummary[]): HabitSummary[] {
    const keys = new Set(routine.blocks.map((block) => this.habitKeyOf(block)));
    return habits.filter((summary) => keys.has(summary.habit.key));
  }

  /** El hábito que se cumple con un bloque: el suyo, o el de la ruta del tema. */
  private habitKeyOf(block: RoutineBlock): string | undefined {
    if (block.kind === "habit") return this.habitOf(block.ref)?.key;
    return block.kind === "module" ? this.moduleFor(block)?.roadmap.habit : undefined;
  }

  /**
   * El hábito de un bloque va por su clave. Las rutinas de antes lo señalan con el wikilink a
   * su nota antigua, que sigue en el vault y guarda la clave.
   */
  habitOf(ref: string | undefined): Habit | undefined {
    const name = linkTarget(ref);
    const key = name ? this.store.findByName(name)?.data.key : ref;
    return typeof key === "string" ? this.habits.get(key) : undefined;
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
          title: blockTitle(block),
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
    return this.list().routines.filter((summary) => isRoutineOn(summary.routine, today));
  }

  async setActive(path: string, active: boolean): Promise<void> {
    await this.store.write(path, setFrontmatter(await this.store.read(path), ["active"], active));
  }

  /** Cambia el nombre, la hora o los días. Las horas de los bloques se recalculan solas. */
  async update(path: string, changes: RoutineChanges): Promise<void> {
    let source = await this.store.read(path);
    for (const [key, value] of Object.entries(changes)) {
      if (value !== undefined) source = setFrontmatter(source, [key], value);
    }
    await this.store.write(path, source);
  }

  /** Crea la nota de una rutina a partir de una plantilla. Devuelve su ruta. */
  async createFromTemplate(
    template: RoutineTemplate,
    changes: Partial<RoutineInput> = {},
  ): Promise<string> {
    return this.create({ ...ROUTINE_TEMPLATES[template], ...changes });
  }

  /** Crea la nota de una rutina. Devuelve su ruta. */
  async create(input: RoutineInput): Promise<string> {
    const fields = {
      type: "routine",
      ...input,
      area: input.area ? `[[${linkTarget(input.area) ?? input.area}]]` : undefined,
      active: input.active ?? true,
    };
    const path = await this.store.freePath(this.store.config.folders.routines, input.title);
    await this.store.write(path, newNoteSource(fields, input.title));
    return path;
  }

  /** Borra la nota de la rutina. Lo que ya hiciste (hábitos, tareas) se queda en tus notas. */
  async remove(path: string): Promise<void> {
    await this.store.remove(path);
  }

  /** Cambia un bloque de sitio. Se mueve la entrada tal cual, con los campos que tenga. */
  moveBlock(path: string, from: number, to: number): Promise<void> {
    return this.editBlocks(path, (blocks) => moveBlock(blocks, from, to));
  }

  /** Añade un bloque en una posición; sin posición, al final. */
  addBlock(path: string, block: RoutineBlock, at?: number): Promise<void> {
    return this.editBlocks(path, (blocks) => insertBlock(blocks, withoutEmptyFields(block), at));
  }

  removeBlock(path: string, index: number): Promise<void> {
    return this.editBlocks(path, (blocks) => removeBlock(blocks, index));
  }

  /** Cambia los minutos o el título de un bloque. */
  updateBlock(
    path: string,
    index: number,
    changes: Partial<Pick<RoutineBlock, "minutes" | "title">>,
  ): Promise<void> {
    return this.editBlocks(path, (blocks) => updateBlock(blocks, index, changes));
  }

  // Se trabaja con la lista tal como está escrita para no perder campos que la app no conoce.
  private async editBlocks(
    path: string,
    edit: (blocks: Record<string, unknown>[]) => Record<string, unknown>[],
  ): Promise<void> {
    const current = this.store.get(path)?.data.blocks;
    const blocks = Array.isArray(current) ? (current as Record<string, unknown>[]) : [];
    const source = await this.store.read(path);
    await this.store.write(path, setFrontmatter(source, ["blocks"], edit(blocks)));
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
   * Terminar un bloque: si es un hábito, se apunta en la daily de hoy; si es un tema
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

function withoutEmptyFields(block: RoutineBlock): Record<string, unknown> {
  return Object.fromEntries(Object.entries(block).filter(([, value]) => value !== undefined));
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
