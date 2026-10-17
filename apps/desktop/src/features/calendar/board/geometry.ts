import { minutesOf, type CalendarDay } from "@rumbo/core";

export const HOUR_HEIGHT = 56;
export const GUTTER_WIDTH = 64;
export const MIN_DAY_WIDTH = 150;
export const MIN_EVENT_HEIGHT = 26;

/** Un tramo del día en minutos desde las 0:00. */
export interface MinuteRange {
  from: number;
  to: number;
}

const DEFAULT_RANGE: MinuteRange = { from: 7 * 60, to: 23 * 60 };

/** Las horas que se dibujan: de 7:00 a 23:00, más lo que se salga de ahí. */
export function rangeOf(days: CalendarDay[]): MinuteRange {
  const events = days.flatMap((day) => day.events);
  return {
    from: Math.min(
      DEFAULT_RANGE.from,
      ...events.map((e) => Math.floor(minutesOf(e.start) / 60) * 60),
    ),
    to: Math.max(DEFAULT_RANGE.to, ...events.map((e) => Math.ceil(minutesOf(e.end) / 60) * 60)),
  };
}

export function gridHeight(range: MinuteRange): number {
  return offsetOf(range.to, range);
}

/** Los píxeles desde lo alto de la rejilla hasta unos minutos del día. */
export function offsetOf(minutes: number, range: MinuteRange): number {
  return ((minutes - range.from) / 60) * HOUR_HEIGHT;
}

export function minutesAtOffset(offset: number, range: MinuteRange): number {
  return range.from + (offset / HOUR_HEIGHT) * 60;
}

/** Las horas en punto que llevan etiqueta: las de dentro, sin la primera ni la última línea. */
export function hoursOf(range: MinuteRange): number[] {
  return Array.from(
    { length: (range.to - range.from) / 60 - 1 },
    (_, i) => range.from / 60 + i + 1,
  );
}
