import type { RumboConfig } from "../vault/config";
import { formatDate, type IsoDate } from "./dates";
import type { Habit, HabitHistory, HabitValue } from "./habits";

export function dailyPath(config: RumboConfig, date: IsoDate): string {
  return `${config.folders.daily}/${formatDate(date, config.folders.daily_format)}.md`;
}

/**
 * Contenido de una daily nueva. Si el vault tiene plantilla "Daily", se usa
 * rellenando las fechas de Templater; si no, una sencilla por defecto.
 */
export function newDailyNote(date: IsoDate, habits: Habit[], template?: string): string {
  if (template) {
    return template.replace(/<%\s*tp\.date\.now\(\s*"YYYY-MM-DD"\s*\)\s*%>/g, date);
  }

  // Los hábitos de tareas no se apuntan en la daily: se cumplen al terminar sus tareas.
  const habitLines = habits
    .filter((habit) => habit.kind !== "tasks")
    .map((habit) => `  ${habit.key}: ${habit.kind === "check" ? "false" : 0}`);
  return [
    "---",
    "type: daily",
    `date: ${date}`,
    ...(habitLines.length > 0 ? ["habits:", ...habitLines] : []),
    "---",
    "",
    "## Foco de hoy",
    "",
    "## Agenda",
    "",
    "## Notas del día",
    "",
  ].join("\n");
}

/** Un historial por hábito, sacado del campo "habits" de todas las dailies. */
export function habitHistories(
  dailies: { data: Record<string, unknown> }[],
): Map<string, HabitHistory> {
  const histories = new Map<string, HabitHistory>();

  for (const { data } of dailies) {
    const date = typeof data.date === "string" ? data.date : undefined;
    const values = data.habits;
    if (!date || typeof values !== "object" || values === null) continue;

    for (const [key, value] of Object.entries(values)) {
      if (!isHabitValue(value)) continue;
      const history = histories.get(key) ?? new Map<IsoDate, HabitValue>();
      history.set(date, value);
      histories.set(key, history);
    }
  }
  return histories;
}

function isHabitValue(value: unknown): value is HabitValue {
  return typeof value === "boolean" || typeof value === "number";
}
