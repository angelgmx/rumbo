// Traducciones comunes entre el código (en inglés) y las columnas (en castellano).
import type { Weekday } from "../domain/dates";
import type { HabitSchedule } from "../domain/habits";

const WEEKDAY_TO_ROW: Record<Weekday, string> = {
  mon: "lun",
  tue: "mar",
  wed: "mie",
  thu: "jue",
  fri: "vie",
  sat: "sab",
  sun: "dom",
};
const WEEKDAY_FROM_ROW = invert(WEEKDAY_TO_ROW);

/** Cuándo toca, en JSON: "diaria", ["lun", "mie"] o {"veces_por_semana": 3}. */
export type ScheduleRow = "diaria" | string[] | { veces_por_semana: number };

export function scheduleToRow(schedule: HabitSchedule): ScheduleRow {
  if (schedule === "daily") return "diaria";
  if (Array.isArray(schedule)) return schedule.map((day) => WEEKDAY_TO_ROW[day]);
  return { veces_por_semana: schedule.times_per_week };
}

export function scheduleFromRow(row: ScheduleRow): HabitSchedule {
  if (row === "diaria") return "daily";
  if (Array.isArray(row)) return row.flatMap((day) => WEEKDAY_FROM_ROW[day] ?? []);
  return { times_per_week: row.veces_por_semana };
}

export function invert<K extends string>(map: Record<K, string>): Record<string, K> {
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]));
}
