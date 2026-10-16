import { addDays, startOfWeek, type IsoDate } from "@rumbo/core";
import { addMonths } from "@/lib/calendar";
import type { DateRange } from "./types";

export interface Shortcut {
  label: string;
  /** Sin `range`, el atajo conserva el inicio y deja elegir solo el fin. */
  range?: DateRange;
}

/** Para una vigencia: sin fechas es "siempre". */
export function validityShortcuts(today: IsoDate): Shortcut[] {
  return [
    { label: "Siempre", range: {} },
    { label: "1 mes", range: { start: today, end: addMonths(today, 1) } },
    { label: "3 meses", range: { start: today, end: addMonths(today, 3) } },
    { label: "Hasta…" },
  ];
}

/** Para un periodo con principio y fin, como un objetivo: sin fechas, a un plazo o hasta fin de año. */
export function spanShortcuts(today: IsoDate): Shortcut[] {
  return [
    { label: "1 mes", range: { start: today, end: addMonths(today, 1) } },
    { label: "3 meses", range: { start: today, end: addMonths(today, 3) } },
    { label: "Este año", range: { start: today, end: `${today.slice(0, 4)}-12-31` } },
    { label: "Hasta…" },
    { label: "Sin fechas", range: {} },
  ];
}

/** Para cuándo se hace algo: el día de inicio y, si hace falta, el de fin. */
export function scheduleShortcuts(today: IsoDate): Shortcut[] {
  return [
    { label: "Hoy", range: { start: today } },
    { label: "Mañana", range: { start: addDays(today, 1) } },
    { label: "Lunes", range: { start: addDays(startOfWeek(today), 7) } },
    { label: "Sin fecha", range: {} },
  ];
}

/** Para un solo día, como una fecha límite. */
export function dayShortcuts(today: IsoDate): Shortcut[] {
  return [
    { label: "Hoy", range: { start: today } },
    { label: "Mañana", range: { start: addDays(today, 1) } },
    { label: "En 1 semana", range: { start: addDays(today, 7) } },
    { label: "Sin fecha", range: {} },
  ];
}

export function isActive(shortcut: Shortcut, value: DateRange): boolean {
  return (
    shortcut.range !== undefined &&
    shortcut.range.start === value.start &&
    shortcut.range.end === value.end
  );
}
