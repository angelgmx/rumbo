import type { IsoDate } from "@rumbo/core";

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

const listFormat = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

/** "Operadores, Strings y Bucles" */
export function formatList(items: string[]): string {
  return listFormat.format(items);
}

const weekdayFormat = new Intl.DateTimeFormat("es", { weekday: "short" });

/** "vie" */
export function formatShortWeekday(date: IsoDate): string {
  return weekdayFormat.format(toDate(date)).replace(".", "");
}
