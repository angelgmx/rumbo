import { addDays, startOfWeek, type IsoDate } from "@rumbo/core";
import { capitalize } from "./format";

/** Las 6 semanas que se ven de un mes, de lunes a domingo: "2026-10" → 42 días. */
export function monthGrid(month: string): IsoDate[] {
  const first = startOfWeek(`${month}-01`);
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

/** El mes de al lado: "2026-12", +1 → "2027-01". */
export function shiftMonth(month: string, by: number): string {
  const [year, number] = month.split("-").map(Number);
  const index = year! * 12 + (number! - 1) + by;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** Misma fecha, `by` meses después (o antes); si el día no existe, el último del mes. */
export function addMonths(date: IsoDate, by: number): IsoDate {
  const month = shiftMonth(date.slice(0, 7), by);
  const [year, number] = month.split("-").map(Number);
  const lastDay = new Date(year!, number!, 0).getDate();
  return `${month}-${String(Math.min(Number(date.slice(8)), lastDay)).padStart(2, "0")}`;
}

const monthFormat = new Intl.DateTimeFormat("es", { month: "long", year: "numeric" });

/** "octubre de 2026" */
export function formatMonth(month: string): string {
  const [year, number] = month.split("-").map(Number);
  return monthFormat.format(new Date(year!, number! - 1, 1));
}

/** "Octubre 2026" */
export function formatMonthTitle(month: string): string {
  return capitalize(formatMonth(month).replace(" de ", " "));
}
