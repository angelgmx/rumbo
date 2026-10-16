import { z } from "zod";
import {
  addDays,
  daysBetween,
  startOfWeek,
  WEEKDAYS,
  weekdayOf,
  type IsoDate,
  type Weekday,
} from "./dates";

export const HABIT_KINDS = ["check", "count", "duration", "tasks"] as const;
export type HabitKind = (typeof HABIT_KINDS)[number];

/** Cuándo toca: todos los días, unos días de la semana o N veces por semana. */
export const scheduleSchema = z.union([
  z.literal("daily"),
  z.array(z.enum(WEEKDAYS)),
  z.object({ times_per_week: z.number().int().min(1).max(7) }),
]);
export type HabitSchedule = z.infer<typeof scheduleSchema>;

export const timeSchema = z.string().regex(/^\d{1,2}:\d{2}$/);

export interface Habit {
  /** Clave corta y fija ("ingles-b2"): la usan las tareas y las rutas para señalarlo. */
  key: string;
  name: string;
  /** Cómo se cumple: hecho o no, una cantidad, un tiempo, o terminando sus tareas del día. */
  kind: HabitKind;
  target?: number;
  /** Lo mínimo que salva la racha en un hábito de cantidad o tiempo. Por defecto, la mitad del objetivo. */
  minimum?: number;
  unit?: string;
  schedule: HabitSchedule;
  /** El nombre de la nota del área ("Gym"). */
  area?: string;
  /** Icono de Lucide ("dumbbell") y color ("#34C38F"). Sin ellos, los del área. */
  icon?: string;
  color?: string;
  /** El objetivo al que empuja. */
  goalId?: number;
  /** Franja en la que lo haces ("07:00" a "08:30"). Con ella sale en tu día y en el calendario. */
  start?: string;
  end?: string;
  started?: IsoDate;
  /** Si es un reto con fin (30, 66, 90 días…): el último día. */
  until?: IsoDate;
  archived: boolean;
}

/** Lo apuntado de un hábito un día: hecho o no, o una cantidad. */
export type HabitValue = boolean | number;

/** Valor del hábito por día. */
export type HabitHistory = Map<IsoDate, HabitValue>;

export interface Streak {
  count: number;
  unit: "days" | "weeks";
}

export function isDone(habit: Habit, value: HabitValue | undefined): boolean {
  return habitProgress(habit, value) >= 1;
}

/** Cuánto llevas del hábito ese día, de 0 a 1. Sirve para los anillos de progreso. */
export function habitProgress(habit: Habit, value: HabitValue | undefined): number {
  if (value === undefined || value === false) return 0;
  if (value === true) return 1;
  return Math.min(value / (habit.target ?? 1), 1);
}

/** La versión mínima de un hábito de cantidad o tiempo; los demás no la tienen. */
export function minimumOf(habit: Habit): number | undefined {
  if (habit.kind !== "count" && habit.kind !== "duration") return undefined;
  return habit.minimum ?? Math.ceil((habit.target ?? 1) / 2);
}

/** Lo que suma o resta un toque en un hábito de cantidad (1) o de tiempo (5 minutos). */
export function habitStep(habit: Habit): number {
  return habit.kind === "duration" ? 5 : 1;
}

/** Si ese día mantiene la racha: el hábito cumplido o, al menos, su versión mínima. */
export function keepsStreak(habit: Habit, value: HabitValue | undefined): boolean {
  if (isDone(habit, value)) return true;
  const minimum = minimumOf(habit);
  return minimum !== undefined && typeof value === "number" && value >= minimum;
}

export function isScheduledOn(schedule: HabitSchedule, date: IsoDate): boolean {
  if (schedule === "daily") return true;
  if (Array.isArray(schedule)) return schedule.includes(weekdayOf(date));
  // "N veces por semana" se puede hacer cualquier día.
  return true;
}

/** Los días malos no rompen la racha: se saltan, y si ese día lo hiciste, cuenta. */
type BadDays = ReadonlySet<IsoDate>;

const NO_BAD_DAYS: BadDays = new Set();

export function currentStreak(
  habit: Habit,
  history: HabitHistory,
  today: IsoDate,
  badDays: BadDays = NO_BAD_DAYS,
): Streak {
  if (isWeeklyTarget(habit.schedule)) {
    return { count: countWeeksBack(habit, history, today, badDays), unit: "weeks" };
  }
  return { count: countDaysBack(habit, history, today, badDays), unit: "days" };
}

export function bestStreak(
  habit: Habit,
  history: HabitHistory,
  today: IsoDate,
  badDays: BadDays = NO_BAD_DAYS,
): Streak {
  const first = firstDay(habit, history, today);
  const weekly = isWeeklyTarget(habit.schedule);
  let best = 0;
  let running = 0;

  const step = weekly ? 7 : 1;
  for (let day = weekly ? startOfWeek(first) : first; day <= today; day = addDays(day, step)) {
    if (!weekly && !isScheduledOn(habit.schedule, day)) continue;

    if (!weekly && isExcused(habit, history, day, badDays)) continue;

    const done = weekly
      ? isWeekDone(habit, history, day, badDays)
      : keepsStreak(habit, history.get(day));
    running = done ? running + 1 : 0;
    best = Math.max(best, running);
  }
  return { count: best, unit: weekly ? "weeks" : "days" };
}

/** Parte de los días (o semanas) que tocaban y se hicieron entre dos fechas, de 0 a 1. */
export function completionRate(
  habit: Habit,
  history: HabitHistory,
  from: IsoDate,
  to: IsoDate,
): number {
  if (isWeeklyTarget(habit.schedule)) {
    let weeks = 0;
    let done = 0;
    for (let week = startOfWeek(from); week <= to; week = addDays(week, 7)) {
      weeks++;
      if (isWeekDone(habit, history, week)) done++;
    }
    return weeks === 0 ? 0 : done / weeks;
  }

  let scheduled = 0;
  let done = 0;
  for (let day = from; day <= to; day = addDays(day, 1)) {
    if (!isScheduledOn(habit.schedule, day)) continue;
    scheduled++;
    if (isDone(habit, history.get(day))) done++;
  }
  return scheduled === 0 ? 0 : done / scheduled;
}

function isExcused(habit: Habit, history: HabitHistory, day: IsoDate, badDays: BadDays): boolean {
  return badDays.has(day) && !keepsStreak(habit, history.get(day));
}

function countDaysBack(
  habit: Habit,
  history: HabitHistory,
  today: IsoDate,
  badDays: BadDays,
): number {
  // Hoy aún está "en curso": no haberlo hecho todavía no rompe la racha.
  let day = keepsStreak(habit, history.get(today)) ? today : addDays(today, -1);
  const first = firstDay(habit, history, today);
  let count = 0;

  for (; day >= first; day = addDays(day, -1)) {
    // Un hábito de lunes a viernes no pierde la racha el fin de semana.
    if (!isScheduledOn(habit.schedule, day) || isExcused(habit, history, day, badDays)) continue;
    if (!keepsStreak(habit, history.get(day))) break;
    count++;
  }
  return count;
}

function countWeeksBack(
  habit: Habit,
  history: HabitHistory,
  today: IsoDate,
  badDays: BadDays,
): number {
  // Lo mismo con semanas: la semana actual solo cuenta cuando se llega al objetivo.
  let week = startOfWeek(today);
  if (!isWeekDone(habit, history, week, badDays)) week = addDays(week, -7);
  const first = startOfWeek(firstDay(habit, history, today));
  let count = 0;

  for (; week >= first; week = addDays(week, -7)) {
    if (!isWeekDone(habit, history, week, badDays)) break;
    count++;
  }
  return count;
}

function isWeekDone(
  habit: Habit,
  history: HabitHistory,
  weekStart: IsoDate,
  badDays: BadDays = NO_BAD_DAYS,
): boolean {
  const target = isWeeklyTarget(habit.schedule) ? habit.schedule.times_per_week : 7;
  let done = 0;
  let excused = 0;
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    if (isDone(habit, history.get(day))) done++;
    else if (isExcused(habit, history, day, badDays)) excused++;
  }
  // Cada día malo sin hacer rebaja lo que se pide esa semana.
  return done >= Math.min(target, 7 - excused);
}

function isWeeklyTarget(schedule: HabitSchedule): schedule is { times_per_week: number } {
  return typeof schedule === "object" && !Array.isArray(schedule);
}

/** Hasta dónde mirar hacia atrás: la fecha de inicio o el día más antiguo con datos. */
function firstDay(habit: Habit, history: HabitHistory, today: IsoDate): IsoDate {
  if (habit.started) return habit.started;
  const days = [...history.keys()].sort();
  return days[0] ?? today;
}

/** Lo que se rellena al crear o editar un hábito. El área va por su nombre. */
export interface HabitInput {
  name: string;
  kind: Habit["kind"];
  target?: number;
  unit?: string;
  schedule: HabitSchedule;
  area?: string;
  goalId?: number;
  icon?: string;
  color?: string;
  /** Último día, si es un reto con duración. */
  until?: IsoDate;
  start?: string;
  end?: string;
}

/**
 * La clave corta del hábito: "Inglés B2" → "ingles-b2".
 * Si ya existe, se le añade un número para que no se mezclen historiales.
 */
export function habitKeyFor(name: string, existing: string[]): string {
  const base =
    name
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "habito";

  let key = base;
  for (let n = 2; existing.includes(key); n++) key = `${base}-${n}`;
  return key;
}

/** Cuántas veces toca el hábito en la semana de `date` y cuántas se han hecho ya. */
export function weekProgress(
  habit: Habit,
  history: HabitHistory,
  date: IsoDate,
): { done: number; due: number } {
  const monday = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const done = days.filter((day) => isDone(habit, history.get(day))).length;
  const due = isWeeklyTarget(habit.schedule)
    ? habit.schedule.times_per_week
    : days.filter((day) => isScheduledOn(habit.schedule, day)).length;
  return { done, due };
}

/** Los campos del hábito que salen del formulario, limpios: sin lo que no aplica a su tipo. */
export function habitFromInput(input: HabitInput): Omit<Habit, "key" | "started" | "archived"> {
  const hasAmount = input.kind === "count" || input.kind === "duration";
  // Una franja sin las dos horas no sirve para dibujarla.
  const hasTime = Boolean(input.start && input.end);
  return {
    name: input.name.trim(),
    kind: input.kind,
    target: hasAmount ? input.target : undefined,
    unit: hasAmount ? input.unit?.trim() || undefined : undefined,
    schedule: input.schedule,
    area: input.area?.trim() || undefined,
    goalId: input.goalId,
    icon: input.icon || undefined,
    color: input.color || undefined,
    until: input.until || undefined,
    start: hasTime ? input.start : undefined,
    end: hasTime ? input.end : undefined,
  };
}

export interface Challenge {
  /** Día del reto en el que vas (1 el primer día). */
  day: number;
  total: number;
  finished: boolean;
}

/** En qué punto del reto estás. Sin fecha de fin no hay reto. */
export function challengeProgress(habit: Habit, today: IsoDate): Challenge | undefined {
  if (!habit.until || !habit.started) return undefined;
  const total = daysBetween(habit.started, habit.until) + 1;
  const day = Math.min(daysBetween(habit.started, today) + 1, total);
  return { day, total, finished: today > habit.until };
}

export interface HabitStats {
  /** Días en que se cumplió. */
  doneDays: number;
  /** Suma de lo apuntado en los de cantidad o tiempo (páginas, minutos…). */
  amount: number;
  /** El día de la semana en que más lo cumples. */
  bestWeekday?: Weekday;
}

export function habitStats(habit: Habit, history: HabitHistory): HabitStats {
  const byWeekday = new Map<Weekday, number>();
  let doneDays = 0;
  let amount = 0;

  for (const [date, value] of history) {
    if (typeof value === "number") amount += value;
    if (!isDone(habit, value)) continue;
    doneDays++;
    const weekday = weekdayOf(date);
    byWeekday.set(weekday, (byWeekday.get(weekday) ?? 0) + 1);
  }

  const best = [...byWeekday].sort((a, b) => b[1] - a[1])[0];
  return { doneDays, amount, bestWeekday: best?.[0] };
}
