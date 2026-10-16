// Organizar tareas sueltas con IA: qué es una tarea suelta, qué huecos libres hay en la agenda,
// qué se le pregunta al modelo y cómo se lee lo que responde. La IA solo propone una fecha y
// una hora dentro de los huecos que calcula core: lo que se salga de ellos se descarta.
import { z } from "zod";
import { addMinutesToTime, minutesBetween } from "./agenda";
import { jsonIn, knownArea } from "./aiAnswer";
import { spanishWeekday, type IsoDate } from "./dates";
import type { AiMessage } from "../ports";
import type { Priority, Task, TaskChanges } from "./tasks";

export interface Interval {
  start: string;
  end: string;
}

export interface FreeSlot extends Interval {
  date: IsoDate;
}

export interface Deadline {
  date: IsoDate;
  text: string;
}

export interface OrganizeContext {
  areas: string[];
  slots: FreeSlot[];
  deadlines: Deadline[];
}

export interface OrganizeProposal {
  steps?: string[];
  priority?: Priority;
  area?: string;
  duration?: number;
  date?: IsoDate;
  time?: string;
}

export interface OrganizeAnswer {
  proposals: Map<number, OrganizeProposal>;
  /** Los huecos que quedan después de repartir las tareas de la respuesta. */
  slots: FreeSlot[];
}

export const ORGANIZE_HORIZON_DAYS = 7;
const DAY_START = "08:00";
const DAY_END = "21:00";
const MIN_SLOT_MINUTES = 30;
const DEFAULT_MINUTES = 30;
const MIN_STEPS = 2;
const MAX_STEPS = 5;
const MIN_DURATION = 5;
const MAX_DURATION = 240;
const PRIORITIES = ["high", "medium", "low"] as const;

/** Suelta: sin fecha ni pasos y sin hacer. Lo que el usuario ya organizó no se toca. */
export function isLooseTask(task: Task): boolean {
  return !task.done && !task.scheduled && !task.due && task.steps.length === 0;
}

/** Cuándo acaba algo de la agenda; si no lo dice, se da por un rato corto. */
export function blockEnd(start: string, end: string | undefined): string {
  return end ?? addMinutesToTime(start, DEFAULT_MINUTES);
}

/** Lo que ocupa una tarea con hora: lo que dura o, si no lo dice, un rato corto. */
export function taskInterval(task: Task): Interval | undefined {
  if (!task.time) return undefined;
  return { start: task.time, end: addMinutesToTime(task.time, task.duration ?? DEFAULT_MINUTES) };
}

/**
 * Los huecos libres de cada día, entre las 8:00 y las 21:00, sin lo que ya está ocupado.
 * Hoy solo cuenta lo que queda por delante, a partir de la próxima media hora.
 */
export function freeSlots(
  days: IsoDate[],
  busy: ReadonlyMap<IsoDate, Interval[]>,
  today: IsoDate,
  now: string,
): FreeSlot[] {
  return days.flatMap((date) => {
    const dayStart = minutesOf(DAY_START);
    const from = date === today ? Math.max(dayStart, nextHalfHour(now)) : dayStart;
    return gaps(from, minutesOf(DAY_END), busy.get(date) ?? [])
      .filter(([start, end]) => end - start >= MIN_SLOT_MINUTES)
      .map(([start, end]) => ({ date, start: timeOf(start), end: timeOf(end) }));
  });
}

function gaps(from: number, to: number, busy: Interval[]): [number, number][] {
  const result: [number, number][] = [];
  let cursor = from;
  const ordered = [...busy].sort((a, b) => a.start.localeCompare(b.start));
  for (const { start, end } of ordered) {
    if (cursor >= to) break;
    if (minutesOf(start) > cursor) result.push([cursor, Math.min(minutesOf(start), to)]);
    cursor = Math.max(cursor, minutesOf(end));
  }
  if (cursor < to) result.push([cursor, to]);
  return result;
}

export function organizeMessages(tasks: Task[], context: OrganizeContext): AiMessage[] {
  const system = [
    "Organizas tareas sueltas de una app de productividad personal. Para cada una propones:",
    "- steps: de 2 a 5 pasos concretos, cada uno una acción corta.",
    "- priority: high, medium o low.",
    `- area: ${context.areas.join(", ") || "ninguna"}. Usa una solo si encaja.`,
    "- duration: minutos que llevará, de 5 a 240.",
    "- date (AAAA-MM-DD) y time (HH:MM): elige un hueco libre de la lista y una hora donde la tarea quepa entera. Si ninguno encaja, no los pongas.",
    "Huecos libres:",
    ...slotLines(context.slots),
    ...deadlineLines(context.deadlines),
    'Responde solo con JSON: {"items":[{"index":0,"steps":["…"],"priority":"high","area":"…","duration":30,"date":"…","time":"…"}]}',
  ].join("\n");
  const user = tasks.map((task, index) => `${index}. ${task.text}`).join("\n");
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function slotLines(slots: FreeSlot[]): string[] {
  if (slots.length === 0) return ["- ninguno"];
  const days = [...new Set(slots.map((slot) => slot.date))];
  return days.map((date) => {
    const times = slots
      .filter((slot) => slot.date === date)
      .map((slot) => `${slot.start}-${slot.end}`);
    return `- ${spanishWeekday(date)} ${date}: ${times.join(", ")}`;
  });
}

function deadlineLines(deadlines: Deadline[]): string[] {
  if (deadlines.length === 0) return [];
  return [
    "Fechas límite de otras tareas, para no cargar esos días:",
    ...deadlines.map(({ date, text }) => `- ${date}: ${text}`),
  ];
}

const answerSchema = z.object({ items: z.array(z.unknown()) });

// Cada campo se lee por separado: uno mal escrito se pierde, pero no estropea los demás.
const itemSchema = z.object({
  index: z.number().int().nonnegative(),
  steps: z.array(z.string()).nullish().catch(undefined),
  priority: z.enum(PRIORITIES).nullish().catch(undefined),
  area: z.string().nullish().catch(undefined),
  duration: z.number().nullish().catch(undefined),
  date: z.string().nullish().catch(undefined),
  time: z.string().nullish().catch(undefined),
});

type Item = z.infer<typeof itemSchema>;

/**
 * Las propuestas por posición de la tarea. Los pasos, la duración, el área y la fecha que no
 * cuadran se descartan. Las tareas de una misma respuesta no se pisan: cada una ocupa su hueco.
 * `undefined` si la respuesta no se puede leer.
 */
export function parseOrganization(
  answer: string,
  tasks: Task[],
  context: OrganizeContext,
): OrganizeAnswer | undefined {
  const parsed = answerSchema.safeParse(jsonIn(answer));
  if (!parsed.success) return undefined;

  const proposals = new Map<number, OrganizeProposal>();
  let slots = context.slots;
  for (const raw of parsed.data.items) {
    const item = itemSchema.safeParse(raw);
    if (!item.success) continue;
    const task = tasks[item.data.index];
    if (!task || proposals.has(item.data.index)) continue;

    const proposal = readProposal(item.data, task, context.areas, slots);
    if (proposal.date && proposal.time) {
      slots = occupy(slots, proposal.date, proposal.time, minutesFor(proposal, task));
    }
    proposals.set(item.data.index, proposal);
  }
  return { proposals, slots };
}

function readProposal(
  item: Item,
  task: Task,
  areas: string[],
  slots: FreeSlot[],
): OrganizeProposal {
  const duration = validDuration(item.duration);
  const minutes = minutesFor({ duration }, task);
  return {
    steps: validSteps(item.steps),
    priority: item.priority ?? undefined,
    area: knownArea(item.area, areas),
    duration,
    ...validSlot(item.date, item.time, minutes, slots),
  };
}

function validSteps(steps: string[] | null | undefined): string[] | undefined {
  const clean = [...new Set((steps ?? []).map((step) => step.trim()).filter(Boolean))];
  return clean.length >= MIN_STEPS ? clean.slice(0, MAX_STEPS) : undefined;
}

function validDuration(minutes: number | null | undefined): number | undefined {
  if (minutes === null || minutes === undefined) return undefined;
  const rounded = Math.round(minutes);
  return rounded >= MIN_DURATION && rounded <= MAX_DURATION ? rounded : undefined;
}

function validSlot(
  date: string | null | undefined,
  rawTime: string | null | undefined,
  minutes: number,
  slots: FreeSlot[],
): { date?: IsoDate; time?: string } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(rawTime ?? "");
  if (!date || !match) return {};
  const time = `${match[1]!.padStart(2, "0")}:${match[2]}`;
  return slots.some((slot) => fits(slot, date, time, minutes)) ? { date, time } : {};
}

function fits(slot: FreeSlot, date: IsoDate, time: string, minutes: number): boolean {
  return slot.date === date && slot.start <= time && addMinutesToTime(time, minutes) <= slot.end;
}

function occupy(slots: FreeSlot[], date: IsoDate, time: string, minutes: number): FreeSlot[] {
  const end = addMinutesToTime(time, minutes);
  return slots.flatMap((slot) =>
    fits(slot, date, time, minutes)
      ? [
          { ...slot, end: time },
          { ...slot, start: end },
        ].filter((rest) => minutesBetween(rest.start, rest.end) >= MIN_SLOT_MINUTES)
      : [slot],
  );
}

/** Los minutos que ocupará: lo que dice la propuesta, lo que ya tenía la tarea o un rato corto. */
function minutesFor(proposal: Pick<OrganizeProposal, "duration">, task: Task): number {
  return proposal.duration ?? task.duration ?? DEFAULT_MINUTES;
}

/** Deja solo lo que aporta: lo que el usuario ya puso en la tarea no se propone otra vez. */
export function fillGaps(task: Task, proposal: OrganizeProposal): OrganizeProposal {
  return {
    ...proposal,
    priority: task.priority ? undefined : proposal.priority,
    area: task.area ? undefined : proposal.area,
    duration: task.duration ? undefined : proposal.duration,
  };
}

export function hasProposal(proposal: OrganizeProposal): boolean {
  return Object.values(proposal).some((value) => value !== undefined);
}

/** Lo que cambia en la tarea al aceptar la propuesta. */
export function organizeChanges(proposal: OrganizeProposal): TaskChanges {
  const { steps, priority, area, duration, date, time } = proposal;
  return {
    ...(steps && { steps: steps.map((text) => ({ text, done: false })) }),
    ...(priority && { priority }),
    ...(area && { area }),
    ...(duration && { duration }),
    ...(date && { scheduled: date, time }),
  };
}

function minutesOf(time: string): number {
  return minutesBetween("00:00", time);
}

function timeOf(minutes: number): string {
  return addMinutesToTime("00:00", minutes);
}

function nextHalfHour(time: string): number {
  return Math.ceil(minutesOf(time) / 30) * 30;
}
