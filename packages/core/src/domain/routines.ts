import { z } from "zod";
import { addMinutesToTime, minutesBetween } from "./agenda";
import { WEEKDAYS, type IsoDate, type Weekday } from "./dates";
import { isScheduledOn, scheduleSchema, timeSchema, type HabitSchedule } from "./habits";
import { linkTarget } from "./links";
import { taskInterval } from "./taskOrganizing";
import type { Task, TaskDraft } from "./tasks";

// Una rutina es una nota "type: routine": una hora de inicio y una lista de bloques
// en orden. Es lo que une hábitos, temas de una ruta y tareas en un hueco del día:
//   start: "18:00"
//   days: [mon, tue, wed, fri]
//   blocks:
//     - { kind: habit, ref: "[[Hábito — Inglés]]", minutes: 15 }
//     - { kind: module, ref: "[[Java desde cero]]", minutes: 45 }
//     - { kind: task, ref: "12", minutes: 20 }
//     - { kind: activity, title: Café, minutes: 10 }
//     - { kind: break, minutes: 10 }
// `from` y `until` acotan su vigencia: pasada `until`, la rutina deja de tocar.

const ROUTINE_KINDS = ["morning", "afternoon", "evening", "study", "gym", "custom"] as const;
export const BLOCK_KINDS = ["habit", "module", "task", "activity", "break"] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

const blockSchema = z.object({
  kind: z.enum(BLOCK_KINDS),
  /** A qué apunta: la clave de un hábito, un tema (o su ruta, y toca el tema en curso) o el id de una tarea. */
  ref: z.string().optional(),
  title: z.string().optional(),
  minutes: z.number().int().positive(),
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const routineSchema = z.object({
  title: z.string().optional(),
  area: z.string().optional(),
  kind: z.enum(ROUTINE_KINDS).default("custom"),
  days: scheduleSchema.default("daily"),
  start: timeSchema,
  active: z.boolean().default(true),
  /** Primer y último día en que toca; sin ellos, siempre. */
  from: dateSchema.optional(),
  until: dateSchema.optional(),
  /** El objetivo al que empuja. */
  goalId: z.number().int().positive().optional(),
  /** La clave del hábito que marca la rutina, además de los de sus bloques. */
  habit: z.string().optional(),
  blocks: z.array(blockSchema).default([]),
});

export type Routine = z.infer<typeof routineSchema>;
export type RoutineBlock = z.infer<typeof blockSchema>;
export type RoutineInput = z.input<typeof routineSchema> & { title: string };

export interface TimedBlock extends RoutineBlock {
  /** Posición en la lista, para cambiar el bloque en su sitio. */
  index: number;
  start: string;
  end: string;
}

/** Cada bloque con su hora: empieza cuando acaba el anterior. */
export function timedBlocks(routine: Routine): TimedBlock[] {
  let start = routine.start;
  return routine.blocks.map((block, index) => {
    const end = addMinutesToTime(start, block.minutes);
    const timed = { ...block, index, start, end };
    start = end;
    return timed;
  });
}

export function routineMinutes(routine: Routine): number {
  return routine.blocks.reduce((total, block) => total + block.minutes, 0);
}

export function routineEnd(routine: Routine): string {
  return addMinutesToTime(routine.start, routineMinutes(routine));
}

export function isInForce(routine: Routine, date: IsoDate): boolean {
  return (!routine.from || routine.from <= date) && (!routine.until || date <= routine.until);
}

export function isRoutineOn(routine: Routine, date: IsoDate): boolean {
  return routine.active && isInForce(routine, date) && isScheduledOn(routine.days, date);
}

/** Lo que se lee del bloque: su título, o el nombre de la nota a la que apunta. */
export function blockTitle(block: RoutineBlock): string {
  if (block.title) return block.title;
  if (block.kind === "break") return "Descanso";
  if (block.kind === "activity") return "Actividad";
  return linkTarget(block.ref) ?? "";
}

/** Mueve un bloque de sitio. Las horas se recalculan solas al leer. */
export function moveBlock<T>(blocks: T[], from: number, to: number): T[] {
  if (from === to || !blocks[from] || to < 0 || to >= blocks.length) return blocks;
  const result = [...blocks];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved!);
  return result;
}

/** Mete un bloque en una posición; sin posición, al final. */
export function insertBlock<T>(blocks: T[], block: T, at = blocks.length): T[] {
  const index = Math.min(Math.max(at, 0), blocks.length);
  return [...blocks.slice(0, index), block, ...blocks.slice(index)];
}

export function removeBlock<T>(blocks: T[], index: number): T[] {
  return blocks.filter((_, i) => i !== index);
}

/** Cambia algunos campos de un bloque y deja el resto como estaba escrito. */
export function updateBlock<T extends object>(
  blocks: T[],
  index: number,
  changes: Partial<T>,
): T[] {
  return blocks.map((block, i) => (i === index ? { ...block, ...changes } : block));
}

export interface RoutineClash {
  title: string;
  days: Weekday[];
}

export interface TaskClash {
  task: Task;
  date: IsoDate;
}

/**
 * Otras rutinas activas que se solapan en hora algún día que comparten.
 * Las de «N veces por semana» no tienen días fijos, así que no chocan con nada.
 */
export function routineClashes(
  routine: Routine,
  others: { title: string; routine: Routine }[],
): RoutineClash[] {
  const days = fixedDays(routine.days);
  return others
    .filter((other) => other.routine.active && overlapsInTime(routine, other.routine))
    .map((other) => ({
      title: other.title,
      days: fixedDays(other.routine.days).filter((day) => days.includes(day)),
    }))
    .filter((clash) => clash.days.length > 0);
}

/**
 * Tareas pendientes con hora, de hoy en adelante, que caen dentro de la rutina el día que toca.
 * Las que la propia rutina lleva en un bloque no cuentan: ya forman parte de ella.
 */
export function taskClashes(routine: Routine, tasks: Task[], today: IsoDate): TaskClash[] {
  const own = new Set(routine.blocks.filter(({ kind }) => kind === "task").map(({ ref }) => ref));
  const [start, end] = routineSpan(routine);
  return tasks
    .flatMap((task): TaskClash[] => {
      const interval = taskInterval(task);
      if (!interval || !task.scheduled || task.done || task.scheduled < today) return [];
      if (own.has(String(task.id)) || !isRoutineOn(routine, task.scheduled)) return [];
      const from = minutesBetween("00:00", interval.start);
      const to = minutesBetween("00:00", interval.end);
      return from < end && start < to ? [{ task, date: task.scheduled }] : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.task.time!.localeCompare(b.task.time!));
}

function fixedDays(schedule: HabitSchedule): Weekday[] {
  if (schedule === "daily") return [...WEEKDAYS];
  return Array.isArray(schedule) ? schedule : [];
}

/** Desde y hasta qué minuto del día ocupa la rutina. */
function routineSpan(routine: Routine): [number, number] {
  const start = minutesBetween("00:00", routine.start);
  return [start, start + routineMinutes(routine)];
}

function overlapsInTime(a: Routine, b: Routine): boolean {
  const [aStart, aEnd] = routineSpan(a);
  const [bStart, bEnd] = routineSpan(b);
  return aStart < bEnd && bStart < aEnd;
}

/** Lo que hay pendiente del tema que toca, para decidir las tareas de un bloque de estudio. */
export interface ModuleWork {
  roadmapTitle: string;
  moduleTitle: string;
  /** El hábito de la ruta: así las tareas cuentan para cumplirlo. */
  habit?: string;
  area?: string;
  pendingExercises: { id: string; title: string }[];
  pendingResource?: { title: string; minutes?: number };
}

// Más de 3 ejercicios en un bloque deja de ser realista.
const EXERCISES_PER_BLOCK = 3;

/**
 * Las tareas que genera hoy un bloque de un tema: el recurso que toca ver y los
 * siguientes ejercicios. Si no queda nada, repasar el tema.
 */
export function moduleBlockTasks(
  work: ModuleWork,
  block: RoutineBlock,
  today: IsoDate,
): TaskDraft[] {
  const prefix = `${work.roadmapTitle} · ${work.moduleTitle}`;
  const base = { scheduled: today, habit: work.habit, area: work.area };
  const tasks: TaskDraft[] = [];

  if (work.pendingResource) {
    const minutes = Math.min(work.pendingResource.minutes ?? block.minutes, block.minutes);
    tasks.push({
      ...base,
      text: `${prefix}: ver ${work.pendingResource.title}`,
      duration: minutes,
    });
  }

  const exercises = work.pendingExercises.slice(0, EXERCISES_PER_BLOCK);
  if (exercises.length > 0) {
    tasks.push({
      ...base,
      text: `${prefix}: ${exercisesLabel(exercises)}`,
      steps: exercises.map(({ id, title }) => ({ text: `${id} — ${title}`, done: false })),
    });
  }

  if (tasks.length === 0) {
    tasks.push({
      ...base,
      text: `${prefix}: repasar conceptos y criterio de dominado`,
      duration: block.minutes,
    });
  }
  return tasks;
}

function exercisesLabel(exercises: { id: string; title: string }[]): string {
  if (exercises.length === 1) return `ejercicio ${exercises[0]!.id} — ${exercises[0]!.title}`;
  return `ejercicios ${exercises[0]!.id}–${exercises.at(-1)!.id}`;
}
