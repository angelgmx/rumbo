import { addDays, WEEKDAYS, weekdayOf, type IsoDate, type Weekday } from "./dates";
import type { ExerciseLevel } from "./learning";

// El planificador reparte lo que te queda de una ruta en tu horario de estudio
// y calcula cuándo terminarás cada tema. No guarda nada: se recalcula cada vez,
// así que si un día no estudias o vas más rápido, las fechas se mueven solas.

export interface StudySlot {
  days: Weekday[];
  from: string;
  to: string;
}

/** Lo que queda de un tema, en piezas que se pueden medir. */
export interface PendingWork {
  id: string;
  concepts: number;
  exercises: ExerciseLevel[];
  /** Si el tema dice cuántas horas lleva, manda sobre la estimación. */
  estimatedHours?: number;
}

export interface PlannedModule {
  id: string;
  minutes: number;
  /** Día en que se termina, si cabe en el horario dentro del límite de búsqueda. */
  finishes?: IsoDate;
}

// Minutos orientativos. Se pueden afinar con datos reales más adelante.
const MINUTES_PER_CONCEPT = 15;
const MINUTES_PER_EXERCISE: Record<ExerciseLevel, number> = { 1: 20, 2: 35, 3: 60, 4: 25 };
// Con un horario vacío o absurdo no se busca para siempre.
const MAX_DAYS = 3 * 365;

export function exerciseMinutes(level: ExerciseLevel): number {
  return MINUTES_PER_EXERCISE[level];
}

export function pendingMinutes(work: PendingWork): number {
  if (work.estimatedHours !== undefined) return Math.round(work.estimatedHours * 60);
  const exercises = work.exercises.reduce((sum, level) => sum + exerciseMinutes(level), 0);
  return work.concepts * MINUTES_PER_CONCEPT + exercises;
}

/** Minutos de estudio de cada día de la semana según las franjas. */
export function minutesPerWeekday(slots: StudySlot[]): Record<Weekday, number> {
  const result = Object.fromEntries(WEEKDAYS.map((day) => [day, 0])) as Record<Weekday, number>;
  for (const slot of slots) {
    const minutes = toMinutes(slot.to) - toMinutes(slot.from);
    if (minutes <= 0) continue;
    for (const day of slot.days) result[day] += minutes;
  }
  return result;
}

export function weeklyMinutes(slots: StudySlot[]): number {
  return Object.values(minutesPerWeekday(slots)).reduce((sum, minutes) => sum + minutes, 0);
}

/**
 * Reparte los temas, en orden, en los días de estudio a partir de `from` (incluido).
 * Un tema empieza donde terminó el anterior, aunque sea a mitad de un día.
 */
export function planModules(
  work: PendingWork[],
  slots: StudySlot[],
  from: IsoDate,
): PlannedModule[] {
  const perDay = minutesPerWeekday(slots);
  let day = from;
  let usedToday = 0;
  let daysWalked = 0;

  return work.map((item) => {
    let left = pendingMinutes(item);
    if (left === 0) return { id: item.id, minutes: 0, finishes: day };

    while (left > 0 && daysWalked < MAX_DAYS) {
      const free = perDay[weekdayOf(day)] - usedToday;
      if (free >= left) {
        usedToday += left;
        left = 0;
        break;
      }
      left -= Math.max(free, 0);
      day = addDays(day, 1);
      usedToday = 0;
      daysWalked++;
    }
    return { id: item.id, minutes: pendingMinutes(item), finishes: left === 0 ? day : undefined };
  });
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours! * 60 + minutes!;
}
