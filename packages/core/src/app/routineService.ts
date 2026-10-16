import { stringify } from "yaml";
import { habitSchema, type Habit } from "../domain/habits";
import { linkTarget } from "../domain/links";
import {
  isRoutineOn,
  moduleBlockTasks,
  moveBlock,
  ROUTINE_TEMPLATES,
  routineEnd,
  routineMinutes,
  routineSchema,
  timedBlocks,
  type ModuleWork,
  type Routine,
  type RoutineBlock,
  type RoutineInput,
  type RoutineTemplate,
  type TimedBlock,
} from "../domain/routines";
import type { TaskDraft } from "../domain/tasks";
import { setFrontmatter } from "../vault/frontmatter";
import type { DailyService } from "./dailyService";
import type { HabitService } from "./habitService";
import type { LearningService, ModuleSummary } from "./learningService";
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
}

export interface RoutineList {
  routines: RoutineSummary[];
  /** Notas de rutina con el frontmatter mal escrito, para avisar al usuario. */
  invalid: string[];
}

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
    const result: RoutineList = { routines: [], invalid: [] };
    for (const note of this.store.notesOfType("routine")) {
      const parsed = routineSchema.safeParse(note.data);
      if (!parsed.success) {
        result.invalid.push(note.path);
        continue;
      }
      const routine = parsed.data;
      result.routines.push({
        path: note.path,
        name: note.name,
        title: routine.title ?? note.name,
        routine,
        blocks: timedBlocks(routine),
        minutes: routineMinutes(routine),
        end: routineEnd(routine),
      });
    }
    result.routines.sort((a, b) => a.routine.start.localeCompare(b.routine.start));
    return result;
  }

  /** Las rutinas activas que tocan hoy, por hora de inicio. */
  today(): RoutineSummary[] {
    const today = this.daily.today();
    return this.list().routines.filter((summary) => isRoutineOn(summary.routine, today));
  }

  async setActive(path: string, active: boolean): Promise<void> {
    await this.store.write(path, setFrontmatter(await this.store.read(path), ["active"], active));
  }

  /** Crea la nota de una rutina a partir de una plantilla. Devuelve su ruta. */
  async createFromTemplate(
    template: RoutineTemplate,
    changes: Partial<RoutineInput> = {},
  ): Promise<string> {
    const input = { ...ROUTINE_TEMPLATES[template], ...changes };
    const fields = {
      type: "routine",
      ...input,
      area: input.area ? `[[${linkTarget(input.area) ?? input.area}]]` : undefined,
      active: input.active ?? true,
    };
    const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    const frontmatter = stringify(clean, { lineWidth: 0 }).trimEnd();

    const path = await this.freePath(input.title);
    await this.store.write(path, `---\n${frontmatter}\n---\n\n# ${input.title}\n`);
    return path;
  }

  /** Cambia un bloque de sitio. Se mueve la entrada tal cual, con los campos que tenga. */
  async moveBlock(path: string, from: number, to: number): Promise<void> {
    const blocks = this.store.get(path)?.data.blocks;
    if (!Array.isArray(blocks)) return;
    const source = await this.store.read(path);
    await this.store.write(path, setFrontmatter(source, ["blocks"], moveBlock(blocks, from, to)));
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
      const module = this.findModule(block)?.module;
      if (module?.status === "not-started") await this.learning.setStatus(module, "learning");
    }
  }

  private async completeHabit(block: RoutineBlock): Promise<void> {
    const note = this.store.findByName(linkTarget(block.ref) ?? "");
    const parsed = habitSchema.safeParse(note?.data);
    // Los hábitos de tareas se cumplen terminando sus tareas: no se apuntan.
    if (!parsed.success || parsed.data.kind === "tasks") return;

    const habit = parsed.data;
    const today = this.habits.list().habits.find((summary) => summary.habit.key === habit.key);
    const previous = typeof today?.today === "number" ? today.today : 0;
    await this.habits.setValue(
      habit.key,
      valueAfterBlock(habit.kind, previous, block, habit.target),
    );
  }

  private moduleWork(block: RoutineBlock): ModuleWork | undefined {
    const found = this.findModule(block);
    if (!found) return undefined;
    const { roadmap, module } = found;
    const habitNote = this.store
      .notesOfType("habit")
      .find((note) => roadmap.habit !== undefined && note.data.key === roadmap.habit);
    const resource = module.resources.find((candidate) => candidate.status === "pending");

    return {
      roadmapTitle: roadmap.title,
      moduleTitle: module.title,
      habit: roadmap.habit,
      area: linkTarget(habitNote?.data.area),
      pendingExercises: module.exercises.filter((exercise) => !exercise.done),
      pendingResource: resource && { title: resource.title, minutes: resource.minutes },
    };
  }

  /** El bloque apunta a un tema, o a su ruta y entonces toca el tema en curso. */
  private findModule(block: RoutineBlock) {
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

  private async freePath(title: string): Promise<string> {
    const folder = this.store.config.folders.routines;
    const fileName = title.trim().replace(/[\\/:*?"<>|#^[\]]/g, "-");
    let path = `${folder}/${fileName}.md`;
    for (let n = 2; await this.store.exists(path); n++) path = `${folder}/${fileName} ${n}.md`;
    return path;
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
