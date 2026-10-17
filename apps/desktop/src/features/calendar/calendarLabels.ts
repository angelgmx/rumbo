import {
  freeMinutes,
  isoWeek,
  type CalendarDay,
  type CalendarSource,
  type IsoDate,
} from "@rumbo/core";
import { formatMonthTitle } from "@/lib/calendar";
import { capitalize, formatDay, formatDayMonth, formatMinutes } from "@/lib/format";
import type { CalendarMode } from "./calendarView";
import { sourceName } from "./source/sourceInfo";

/** El título grande de la vista: «Octubre 2026» o el día. */
export function viewTitle(mode: CalendarMode, anchor: IsoDate): string {
  return mode === "day" ? capitalize(formatDay(anchor)) : formatMonthTitle(anchor.slice(0, 7));
}

/** Dónde estás, para la miga de arriba: «Semana 42». */
export function viewCrumb(mode: CalendarMode, anchor: IsoDate): string {
  if (mode === "month") return formatMonthTitle(anchor.slice(0, 7));
  return mode === "day" ? `Día ${formatDayMonth(anchor)}` : `Semana ${isoWeek(anchor)}`;
}

/** El resumen bajo el título: la semana y lo que queda libre, o lo que trae el mes; y la fuente abierta. */
export function viewSubtitle(
  mode: CalendarMode,
  anchor: IsoDate,
  days: CalendarDay[],
  source: CalendarSource | undefined,
): string {
  const parts =
    mode === "month" ? monthSummary(days, anchor.slice(0, 7)) : weekSummary(days, anchor);
  if (source) parts.push(`${sourceName(source)} abierto`);
  return parts.join(" · ");
}

function weekSummary(days: CalendarDay[], anchor: IsoDate): string[] {
  const free = freeMinutes(days.flatMap((day) => day.gaps));
  return [`Semana ${isoWeek(anchor)}`, ...(free > 0 ? [`${formatMinutes(free)} libres`] : [])];
}

function monthSummary(days: CalendarDay[], month: string): string[] {
  const own = days.filter((day) => day.date.startsWith(month));
  const tasks = own.reduce(
    (total, day) => total + day.untimed.length + day.events.filter((e) => e.kind === "task").length,
    0,
  );
  const deadlines = own.reduce((total, day) => total + day.deadlines.length, 0);
  return [plural(tasks, "tarea", "tareas"), plural(deadlines, "fecha límite", "fechas límite")];
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
