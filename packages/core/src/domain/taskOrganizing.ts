// Organizar tareas con IA: qué huecos libres hay en la agenda,
// qué se le pregunta al modelo y cómo se lee lo que responde. La IA solo propone una fecha y
// una hora dentro de los huecos que calcula core: lo que se salga de ellos se descarta.
import { z } from "zod";
import { addMinutesToTime, minutesBetween } from "./agenda";
import { jsonIn, knownArea } from "./aiAnswer";
import { spanishWeekday, type IsoDate } from "./dates";
import type { AiMessage } from "../ports";
import { openGaps } from "./taskGaps";
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

/** Algo que ya existe y a lo que se puede vincular una tarea: `value` es lo que se guarda. */
export interface LinkOption {
  value: string;
  label: string;
}

export interface OrganizeLinks {
  projects: LinkOption[];
  modules: LinkOption[];
  goals: LinkOption[];
}

export interface OrganizeContext {
  areas: string[];
  slots: FreeSlot[];
  deadlines: Deadline[];
  /** Solo al completar una tarea: a qué puede vincularla la IA. */
  links?: OrganizeLinks;
}

export interface OrganizeProposal {
  notes?: string;
  steps?: string[];
  priority?: Priority;
  area?: string;
  projectId?: number;
  module?: string;
  goalId?: number;
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
const MAX_NOTES_LENGTH = 400;
const MIN_STEPS = 2;
const MAX_STEPS = 5;
const MIN_DURATION = 5;
const MAX_DURATION = 240;
const PRIORITIES = ["high", "medium", "low"] as const;

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

const RULES = {
  notes:
    "- notes: descripción de 2 o 3 líneas, en castellano y sin relleno: qué es la tarea, para qué sirve y cómo empezar.",
  steps: "- steps: de 2 a 5 pasos concretos, cada uno una acción corta.",
  priority: "- priority: high, medium o low.",
  duration: "- duration: minutos que llevará, de 5 a 240.",
  slot: "- date (AAAA-MM-DD) y time (HH:MM): elige un hueco libre de la lista y una hora donde la tarea quepa entera. Si ninguno encaja, no los pongas. Si la tarea trae un día fijo, no lo cambies: propón solo time dentro de ese día.",
};

const MAX_NOTES_CHARS = 600;

/**
 * Se pregunta solo por lo que le falta a alguna tarea de la tanda; lo que una ya tenga se
 * descarta después (ver fillGaps), así que el modelo no necesita saberlo.
 */
export function organizeMessages(tasks: Task[], context: OrganizeContext): AiMessage[] {
  const open = new Set(tasks.flatMap((task) => openGaps(task, context)));
  const { projects = [], modules = [], goals = [] } = context.links ?? {};
  const system = [
    "Completas tareas de una app de productividad personal con lo que les falta. Para cada una propones:",
    ...(open.has("notes") ? [RULES.notes] : []),
    ...(open.has("steps") ? [RULES.steps] : []),
    ...(open.has("priority") ? [RULES.priority] : []),
    ...(open.has("area") ? [`- area: ${context.areas.join(", ")}. Usa una solo si encaja.`] : []),
    ...(open.has("link")
      ? [
          linkRule("project", "proyectos", projects),
          linkRule("module", "módulos", modules),
          linkRule("goal", "objetivos", goals),
        ].filter((rule) => rule !== undefined)
      : []),
    ...(open.has("duration") ? [RULES.duration] : []),
    ...(open.has("slot") ? [RULES.slot, "Huecos libres:", ...slotLines(context.slots)] : []),
    ...deadlineLines(context.deadlines),
    'Responde solo con JSON: {"items":[{"index":0,"notes":"…","steps":["…"],"priority":"high","area":"…","project":"…","module":"…","goal":"…","duration":30,"date":"…","time":"…"}]}. Deja fuera los campos que no te pido.',
  ].join("\n");
  const user = tasks.map((task, index) => describeTask(task, index)).join("\n");
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function describeTask(task: Task, index: number): string {
  const notes = task.notes.trim().slice(0, MAX_NOTES_CHARS);
  return [
    `${index}. ${task.text}${task.scheduled && !task.time ? ` (día fijo: ${task.scheduled})` : ""}`,
    ...(notes ? [`   Notas: ${notes}`] : []),
  ].join("\n");
}

function linkRule(field: string, plural: string, options: LinkOption[]): string | undefined {
  if (options.length === 0) return undefined;
  return `- ${field}: uno de estos ${plural}, tal cual, solo si encaja claramente: ${options.map((option) => option.label).join("; ")}.`;
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
  notes: z.string().nullish().catch(undefined),
  steps: z.array(z.string()).nullish().catch(undefined),
  priority: z.enum(PRIORITIES).nullish().catch(undefined),
  area: z.string().nullish().catch(undefined),
  duration: z.number().nullish().catch(undefined),
  date: z.string().nullish().catch(undefined),
  time: z.string().nullish().catch(undefined),
  project: z.string().nullish().catch(undefined),
  module: z.string().nullish().catch(undefined),
  goal: z.string().nullish().catch(undefined),
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

    const proposal = readProposal(item.data, task, context, slots);
    const day = proposal.date ?? task.scheduled;
    if (day && proposal.time) {
      slots = occupy(slots, day, proposal.time, minutesFor(proposal, task));
    }
    proposals.set(item.data.index, proposal);
  }
  return { proposals, slots };
}

function readProposal(
  item: Item,
  task: Task,
  context: OrganizeContext,
  slots: FreeSlot[],
): OrganizeProposal {
  const duration = validDuration(item.duration);
  const minutes = minutesFor({ duration }, task);
  return {
    notes: validNotes(item.notes),
    steps: validSteps(item.steps),
    priority: item.priority ?? undefined,
    area: knownArea(item.area, context.areas),
    projectId: numberOf(knownLink(item.project, context.links?.projects)),
    module: knownLink(item.module, context.links?.modules),
    goalId: numberOf(knownLink(item.goal, context.links?.goals)),
    duration,
    ...validSlot(task.scheduled ?? item.date, item.time, minutes, slots, task.scheduled),
  };
}

function knownLink(
  label: string | null | undefined,
  options: LinkOption[] = [],
): string | undefined {
  const wanted = label?.trim().toLowerCase();
  return options.find((option) => option.label.toLowerCase() === wanted)?.value;
}

const numberOf = (value: string | undefined) => (value === undefined ? undefined : Number(value));

function validNotes(notes: string | null | undefined): string | undefined {
  const clean = notes?.trim();
  return clean ? clean.slice(0, MAX_NOTES_LENGTH) : undefined;
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
  fixedDay: IsoDate | undefined,
): { date?: IsoDate; time?: string } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(rawTime ?? "");
  if (!date || !match) return {};
  const time = `${match[1]!.padStart(2, "0")}:${match[2]}`;
  if (!slots.some((slot) => fits(slot, date, time, minutes))) return {};
  return fixedDay ? { time } : { date, time };
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

/**
 * Deja solo lo que aporta: lo que el usuario ya puso en la tarea no se propone otra vez. El
 * objetivo se deja a lo que la tarea ya hereda de su proyecto o su módulo, la fecha, a lo que
 * cabe antes de su fecha límite y, si la tarea ya tiene día, solo se propone su hora.
 */
export function fillGaps(task: Task, proposal: OrganizeProposal): OrganizeProposal {
  const linked = Boolean(task.projectId || task.module || proposal.projectId || proposal.module);
  const late = Boolean(task.due && proposal.date && proposal.date > task.due);
  return {
    notes: task.notes.trim() ? undefined : proposal.notes,
    steps: task.steps.length > 0 ? undefined : proposal.steps,
    priority: task.priority ? undefined : proposal.priority,
    area: task.area ? undefined : proposal.area,
    projectId: task.projectId ? undefined : proposal.projectId,
    module: task.module ? undefined : proposal.module,
    goalId: task.goalId || linked ? undefined : proposal.goalId,
    duration: task.duration ? undefined : proposal.duration,
    date: task.scheduled || late ? undefined : proposal.date,
    time: task.time || late ? undefined : proposal.time,
  };
}

export function hasProposal(proposal: OrganizeProposal): boolean {
  return Object.values(proposal).some((value) => value !== undefined);
}

/** Lo que cambia en la tarea al aceptar la propuesta. */
export function organizeChanges(proposal: OrganizeProposal): TaskChanges {
  const { notes, steps, priority, area, projectId, module, goalId, duration, date, time } =
    proposal;
  return {
    ...(notes && { notes }),
    ...(steps && { steps: steps.map((text) => ({ text, done: false })) }),
    ...(priority && { priority }),
    ...(area && { area }),
    ...(projectId && { projectId }),
    ...(module && { module }),
    ...(goalId && { goalId }),
    ...(duration && { duration }),
    ...(date && { scheduled: date }),
    ...(time && { time }),
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
