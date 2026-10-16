import { addMinutesToTime } from "./agenda";
import { addDays, WEEKDAYS, weekdayOf, type IsoDate } from "./dates";
import type { Priority } from "./tasks";

// Captura rápida en lenguaje natural:
//   "gym mañana 18:00 1h30 #gym"  → bloque en la agenda de mañana, de 18:00 a 19:30
//   "llamar al dentista viernes"  → tarea para el viernes
//   "idea para Citalash"          → tarea sin fecha en el inbox
// El título de la ventana de tarea usa otra lectura: sin hora, con prioridad («!alta»).

export interface Capture {
  text: string;
  date?: IsoDate;
  start?: string;
  end?: string;
  tags: string[];
}

const SPANISH_WEEKDAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const TAG = /\s#([\p{L}\p{N}_/-]+)(?=\s)/u;
const DURATION = /\s(?:(\d+)h(\d{1,2})?|(\d+)\s?min|(\d+)m)(?=\s)/;
const PRIORITY_WORDS: Record<string, Priority> = { alta: "high", media: "medium", baja: "low" };

type Take = (pattern: RegExp) => RegExpExecArray | null;

/** Quita del texto lo que encaja con el patrón y lo devuelve; el resto sigue en `rest()`. */
function scanner(input: string): { take: Take; rest: () => string } {
  let rest = ` ${input.trim()} `;
  return {
    take(pattern) {
      const match = pattern.exec(rest);
      if (match) rest = rest.replace(match[0], " ");
      return match;
    },
    rest: () => rest,
  };
}

export function parseCapture(input: string, today: IsoDate): Capture {
  const { take, rest } = scanner(input);

  const tags = [...rest().matchAll(/\s#([\p{L}\p{N}_/-]+)/gu)].map((m) => m[1]!);
  const date = takeDate(take, today);
  const time = take(/\s(\d{1,2})(?::(\d{2})|h)(?=\s)/);
  const duration = take(DURATION);

  const start = time ? toTime(Number(time[1]), Number(time[2] ?? 0)) : undefined;
  const minutes = duration ? durationInMinutes(duration) : undefined;

  return {
    text: rest().replace(/\s+/g, " ").trim(),
    // Si solo hay hora, es para hoy.
    date: date ?? (start ? today : undefined),
    start,
    end: start && minutes ? addMinutesToTime(start, minutes) : undefined,
    tags,
  };
}

export interface TaskTitle {
  text: string;
  date?: IsoDate;
  /** Minutos. */
  duration?: number;
  priority?: Priority;
  tags: string[];
}

/**
 * Lee el título de una tarea escrito como te salga: «ejercicios strings hoy 45m !alta #java».
 * Lo que reconoce sale del texto; una hora suelta se queda en él, porque una tarea no lleva hora.
 */
export function parseTaskTitle(input: string, today: IsoDate): TaskTitle {
  const { take, rest } = scanner(input);

  const tags: string[] = [];
  for (let tag = take(TAG); tag; tag = take(TAG)) tags.push(tag[1]!);
  const date = takeDate(take, today);
  const duration = take(DURATION);
  const priority = take(/\s!(alta|media|baja)(?=\s)/i);

  return {
    text: rest().replace(/\s+/g, " ").trim(),
    date,
    duration: duration ? durationInMinutes(duration) : undefined,
    priority: priority ? PRIORITY_WORDS[priority[1]!.toLowerCase()] : undefined,
    tags,
  };
}

function takeDate(take: Take, today: IsoDate): IsoDate | undefined {
  if (take(/\spasado mañana(?=\s)/i)) return addDays(today, 2);
  if (take(/\smañana(?=\s)/i)) return addDays(today, 1);
  if (take(/\shoy(?=\s)/i)) return today;

  const weekday = take(new RegExp(`\\s(?:el\\s)?(${SPANISH_WEEKDAYS.join("|")})(?=\\s)`, "i"));
  if (weekday) return nextWeekday(today, SPANISH_WEEKDAYS.indexOf(weekday[1]!.toLowerCase()));

  const dayMonth = take(/\s(\d{1,2})\/(\d{1,2})(?=\s)/);
  if (dayMonth) {
    const year = Number(today.slice(0, 4));
    const date = `${year}-${dayMonth[2]!.padStart(2, "0")}-${dayMonth[1]!.padStart(2, "0")}`;
    // "3/1" escrito en diciembre es enero del año que viene.
    return date < today ? `${year + 1}${date.slice(4)}` : date;
  }
  return undefined;
}

/** El próximo día con ese nombre. Si hoy es lunes, "lunes" es el de la semana que viene. */
function nextWeekday(today: IsoDate, index: number): IsoDate {
  const todayIndex = WEEKDAYS.indexOf(weekdayOf(today));
  const days = (index - todayIndex + 7) % 7 || 7;
  return addDays(today, days);
}

function durationInMinutes(match: RegExpExecArray): number {
  const [, hours, hourMinutes, minutes, shortMinutes] = match;
  if (hours) return Number(hours) * 60 + Number(hourMinutes ?? 0);
  return Number(minutes ?? shortMinutes);
}

function toTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
