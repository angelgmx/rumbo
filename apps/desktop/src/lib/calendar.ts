import { addDays, startOfWeek, type IsoDate } from "@rumbo/core";

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

const monthFormat = new Intl.DateTimeFormat("es", { month: "long", year: "numeric" });

/** "octubre de 2026" */
export function formatMonth(month: string): string {
  const [year, number] = month.split("-").map(Number);
  return monthFormat.format(new Date(year!, number! - 1, 1));
}
