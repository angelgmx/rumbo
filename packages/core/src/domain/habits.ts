import { z } from "zod";
import { addDays, startOfWeek, WEEKDAYS, weekdayOf, type IsoDate, type Weekday } from "./dates";

export const scheduleSchema = z.union([
  z.literal("daily"),
  z.array(z.enum(WEEKDAYS)),
  z.object({ times_per_week: z.number().int().min(1).max(7) }),
]);

export const timeSchema = z.string().regex(/^\d{1,2}:\d{2}$/);

export const habitSchema = z.object({
  key: z.string(),
  name: z.string(),
  /** Cómo se cumple: hecho o no, una cantidad, un tiempo, o terminando sus tareas del día. */
  kind: z.enum(["check", "count", "duration", "tasks"]).default("check"),
  target: z.number().positive().optional(),
  unit: z.string().optional(),
  schedule: scheduleSchema.default("daily"),
  area: z.string().optional(),
  /** El objetivo al que empuja este hábito: "[[Dominar un stack backend]]". */
  goal: z.string().optional(),
  /** Franja en la que lo haces ("07:00" a "08:30"). Con ella sale en tu día y en el calendario. */
  start: timeSchema.optional(),
  end: timeSchema.optional(),
  started: z.coerce.string().optional(),
  /** Si es un reto con fin (30, 66, 90 días…): el último día. */
  until: z.coerce.string().optional(),
  archived: z.boolean().default(false),
});

export type Habit = z.infer<typeof habitSchema>;
export type HabitSchedule = Habit["schedule"];

/** Lo que dice la daily de un hábito: hecho o no, o una cantidad. */
export type HabitValue = boolean | number;

/** Valor del hábito por día, leído de las dailies. */
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

export function isScheduledOn(schedule: HabitSchedule, date: IsoDate): boolean {
  if (schedule === "daily") return true;
  if (Array.isArray(schedule)) return schedule.includes(weekdayOf(date));
  // "N veces por semana" se puede hacer cualquier día.
  return true;
}

export function currentStreak(habit: Habit, history: HabitHistory, today: IsoDate): Streak {
  if (isWeeklyTarget(habit.schedule)) {
    return { count: countWeeksBack(habit, history, today), unit: "weeks" };
  }
  return { count: countDaysBack(habit, history, today), unit: "days" };
}

export function bestStreak(habit: Habit, history: HabitHistory, today: IsoDate): Streak {
  const first = firstDay(habit, history, today);
  const weekly = isWeeklyTarget(habit.schedule);
  let best = 0;
  let running = 0;

  const step = weekly ? 7 : 1;
  for (let day = weekly ? startOfWeek(first) : first; day <= today; day = addDays(day, step)) {
    if (!weekly && !isScheduledOn(habit.schedule, day)) continue;

    const done = weekly ? isWeekDone(habit, history, day) : isDone(habit, history.get(day));
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

function countDaysBack(habit: Habit, history: HabitHistory, today: IsoDate): number {
  // Hoy aún está "en curso": no haberlo hecho todavía no rompe la racha.
  let day = isDone(habit, history.get(today)) ? today : addDays(today, -1);
  const first = firstDay(habit, history, today);
  let count = 0;

  for (; day >= first; day = addDays(day, -1)) {
    // Un hábito de lunes a viernes no pierde la racha el fin de semana.
    if (!isScheduledOn(habit.schedule, day)) continue;
    if (!isDone(habit, history.get(day))) break;
    count++;
  }
  return count;
}

function countWeeksBack(habit: Habit, history: HabitHistory, today: IsoDate): number {
  // Lo mismo con semanas: la semana actual solo cuenta cuando se llega al objetivo.
  let week = startOfWeek(today);
  if (!isWeekDone(habit, history, week)) week = addDays(week, -7);
  const first = startOfWeek(firstDay(habit, history, today));
  let count = 0;

  for (; week >= first; week = addDays(week, -7)) {
    if (!isWeekDone(habit, history, week)) break;
    count++;
  }
  return count;
}

function isWeekDone(habit: Habit, history: HabitHistory, weekStart: IsoDate): boolean {
  const target = isWeeklyTarget(habit.schedule) ? habit.schedule.times_per_week : 7;
  let done = 0;
  for (let i = 0; i < 7; i++) {
    if (isDone(habit, history.get(addDays(weekStart, i)))) done++;
  }
  return done >= target;
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

/** Lo que se rellena al crear o editar un hábito. El área va por su nombre ("Gym"). */
export interface HabitInput {
  name: string;
  kind: Habit["kind"];
  target?: number;
  unit?: string;
  schedule: HabitSchedule;
  area?: string;
  goal?: string;
  /** Último día, si es un reto con duración. */
  until?: IsoDate;
  start?: string;
  end?: string;
}

/**
 * La clave corta que se usa en las dailies: "Inglés B2" → "ingles-b2".
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

/** Los campos del frontmatter que salen del formulario, en el formato de la nota. */
export function habitFields(input: HabitInput): Record<string, unknown> {
  const hasAmount = input.kind === "count" || input.kind === "duration";
  // Una franja sin las dos horas no sirve para dibujarla.
  const hasTime = Boolean(input.start && input.end);
  return {
    name: input.name.trim(),
    kind: input.kind,
    target: hasAmount ? input.target : undefined,
    unit: hasAmount ? input.unit?.trim() || undefined : undefined,
    schedule: input.schedule,
    area: input.area ? `[[${input.area}]]` : undefined,
    goal: input.goal ? `[[${input.goal}]]` : undefined,
    until: input.until || undefined,
    start: hasTime ? input.start : undefined,
    end: hasTime ? input.end : undefined,
    // Quita los campos de versiones anteriores si la nota los tenía.
    steps: undefined,
    time: undefined,
    duration: undefined,
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

function daysBetween(from: IsoDate, to: IsoDate): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  // Date.UTC evita que el cambio de hora cuente un día de más o de menos.
  return Math.round((Date.UTC(y2!, m2! - 1, d2!) - Date.UTC(y1!, m1! - 1, d1!)) / 86_400_000);
}
