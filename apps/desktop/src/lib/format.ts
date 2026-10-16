import { addDays, type IsoDate } from "@rumbo/core";

const dayFormat = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" });
const shortDayFormat = new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric" });

/** "jueves, 15 de octubre" */
export function formatDay(date: IsoDate): string {
  return dayFormat.format(toDate(date));
}

/** "jue 15" */
export function formatShortDay(date: IsoDate): string {
  return shortDayFormat.format(toDate(date));
}

/** "Hoy", "Mañana" o "vie 17" */
export function formatRelativeDay(date: IsoDate, today: IsoDate): string {
  if (date === today) return "Hoy";
  if (date === addDays(today, 1)) return "Mañana";
  return formatShortDay(date);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "1 h 30" o "45 min" */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest}` : `${hours} h`;
}

export function toDate(date: IsoDate): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

const dayMonthFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });

/** "8 ene" */
export function formatDayMonth(date: IsoDate): string {
  return dayMonthFormat.format(toDate(date)).replace(".", "");
}

const monthYearFormat = new Intl.DateTimeFormat("es", { month: "short", year: "numeric" });

/** "sep 2027" */
export function formatMonthYear(date: IsoDate): string {
  return monthYearFormat.format(toDate(date)).replace(".", "").replace(" de ", " ");
}

const weekdayFormat = new Intl.DateTimeFormat("es", { weekday: "short" });

/** "vie" */
export function formatShortWeekday(date: IsoDate): string {
  return weekdayFormat.format(toDate(date)).replace(".", "");
}

const longWeekdayFormat = new Intl.DateTimeFormat("es", { weekday: "long" });

/** "viernes" */
export function formatWeekday(date: IsoDate): string {
  return longWeekdayFormat.format(toDate(date));
}

/** "19 – 22 oct", "28 oct – 2 nov" o "19 oct" */
export function formatDayRange(from: IsoDate, to: IsoDate): string {
  if (from === to) return formatDayMonth(from);
  const start = toDate(from);
  const end = toDate(to);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return `${sameMonth ? start.getDate() : formatDayMonth(from)} – ${formatDayMonth(to)}`;
}

const longDayFormat = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

/** "jueves 16 oct" */
export function formatLongDay(date: IsoDate): string {
  return longDayFormat.format(toDate(date)).replace(",", "").replace(".", "");
}
