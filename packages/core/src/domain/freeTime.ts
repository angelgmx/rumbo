// Tiempo libre de un día: lo que queda entre lo ocupado. Lo comparten el calendario
// (que dibuja los huecos) y la IA (que solo puede colocar tareas dentro de ellos).
import { addMinutesToTime, minutesBetween } from "./agenda";

export interface Interval {
  start: string;
  end: string;
}

/** Los tramos libres de `from` a `to` que duran al menos `minMinutes`, sin lo ocupado. */
export function freeIntervals(
  busy: readonly Interval[],
  from: string,
  to: string,
  minMinutes: number,
): Interval[] {
  const end = minutesOf(to);
  const free: Interval[] = [];
  let cursor = minutesOf(from);
  for (const { start, end: busyEnd } of [...busy].sort((a, b) => a.start.localeCompare(b.start))) {
    if (cursor >= end) break;
    if (minutesOf(start) > cursor) free.push(interval(cursor, Math.min(minutesOf(start), end)));
    cursor = Math.max(cursor, minutesOf(busyEnd));
  }
  if (cursor < end) free.push(interval(cursor, end));
  return free.filter((gap) => minutesBetween(gap.start, gap.end) >= minMinutes);
}

/** Minutos desde las 0:00 hasta una hora «HH:MM». */
export function minutesOf(time: string): number {
  return minutesBetween("00:00", time);
}

/** La hora «HH:MM» de unos minutos desde las 0:00. */
export function timeOf(minutes: number): string {
  return addMinutesToTime("00:00", minutes);
}

function interval(from: number, to: number): Interval {
  return { start: timeOf(from), end: timeOf(to) };
}
