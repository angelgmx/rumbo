import { z } from "zod";
import { addMinutesToTime } from "./agenda";
import type { Counter } from "./counters";
import type { IsoDate } from "./dates";
import { isScheduledOn, scheduleSchema, timeSchema } from "./habits";
import { linkTarget } from "./links";
import type { TaskDraft } from "./tasks";

// Una rutina es una nota "type: routine": una hora de inicio y una lista de bloques
// en orden. Es lo que une hábitos, temas de una ruta y tareas en un hueco del día:
//   start: "18:00"
//   days: [mon, tue, wed, fri]
//   blocks:
//     - { kind: habit, ref: "[[Hábito — Inglés]]", minutes: 15 }
//     - { kind: module, ref: "[[Java desde cero]]", minutes: 45 }
//     - { kind: break, minutes: 10 }

export const ROUTINE_KINDS = ["morning", "afternoon", "evening", "study", "gym", "custom"] as const;
export const BLOCK_KINDS = ["habit", "module", "task", "break", "custom"] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

const blockSchema = z.object({
  kind: z.enum(BLOCK_KINDS),
  /** La nota del bloque: un hábito, un tema (o su ruta, y toca el tema en curso) o una tarea. */
  ref: z.string().optional(),
  title: z.string().optional(),
  minutes: z.number().int().positive(),
});

export const routineSchema = z.object({
  title: z.string().optional(),
  area: z.string().optional(),
  kind: z.enum(ROUTINE_KINDS).default("custom"),
  days: scheduleSchema.default("daily"),
  start: timeSchema,
  active: z.boolean().default(true),
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

export function isRoutineOn(routine: Routine, date: IsoDate): boolean {
  return routine.active && isScheduledOn(routine.days, date);
}

/** Lo que se lee del bloque: su título, o el nombre de la nota a la que apunta. */
export function blockTitle(block: RoutineBlock): string {
  if (block.title) return block.title;
  if (block.kind === "break") return "Descanso";
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
      counter: { kind: "minutes", current: 0, target: minutes },
    });
  }

  const exercises = work.pendingExercises.slice(0, EXERCISES_PER_BLOCK);
  if (exercises.length > 0) {
    tasks.push({
      ...base,
      text: `${prefix}: ${exercisesLabel(exercises)}`,
      counter: { kind: "progress", current: 0, target: exercises.length },
    });
  }

  if (tasks.length === 0) {
    const counter: Counter = { kind: "minutes", current: 0, target: block.minutes };
    tasks.push({ ...base, text: `${prefix}: repasar conceptos y criterio de dominado`, counter });
  }
  return tasks;
}

function exercisesLabel(exercises: { id: string; title: string }[]): string {
  if (exercises.length === 1) return `ejercicio ${exercises[0]!.id} — ${exercises[0]!.title}`;
  return `ejercicios ${exercises[0]!.id}–${exercises.at(-1)!.id}`;
}

export type RoutineTemplate = "morning" | "study" | "gym" | "evening" | "weekend";

/** Puntos de partida: se crean como nota y luego cada uno los cambia a su gusto. */
export const ROUTINE_TEMPLATES: Record<RoutineTemplate, RoutineInput> = {
  morning: {
    title: "Rutina de mañana",
    kind: "morning",
    days: ["mon", "tue", "wed", "thu", "fri"],
    start: "07:30",
    blocks: [
      { kind: "custom", title: "Café", minutes: 10 },
      { kind: "custom", title: "Escuchar inglés", minutes: 15 },
      { kind: "custom", title: "Revisar Hoy", minutes: 5 },
    ],
  },
  study: {
    title: "Rutina de estudio",
    kind: "study",
    days: ["mon", "tue", "wed", "fri"],
    start: "18:00",
    blocks: [
      { kind: "custom", title: "Repaso del tema anterior", minutes: 15 },
      { kind: "module", title: "Tema de la ruta", minutes: 45 },
      { kind: "break", minutes: 10 },
      { kind: "module", title: "Tema de la ruta", minutes: 50 },
    ],
  },
  gym: {
    title: "Rutina de gym",
    kind: "gym",
    days: ["mon", "wed", "fri"],
    start: "18:00",
    blocks: [
      { kind: "custom", title: "Calentamiento", minutes: 10 },
      { kind: "custom", title: "Entrenamiento", minutes: 60 },
      { kind: "custom", title: "Estiramientos", minutes: 10 },
    ],
  },
  evening: {
    title: "Rutina de noche",
    kind: "evening",
    days: "daily",
    start: "21:30",
    blocks: [
      { kind: "custom", title: "Cerrar el día", minutes: 10 },
      { kind: "custom", title: "Leer", minutes: 20 },
      { kind: "custom", title: "Preparar mañana", minutes: 10 },
    ],
  },
  weekend: {
    title: "Rutina de fin de semana",
    kind: "custom",
    days: ["sat", "sun"],
    start: "10:00",
    blocks: [
      { kind: "custom", title: "Proyecto en curso", minutes: 120 },
      { kind: "break", minutes: 15 },
      { kind: "custom", title: "Ejercicios del tema", minutes: 45 },
    ],
  },
};
