// El formato antiguo de los hábitos: una nota por hábito y lo hecho en el frontmatter de cada
// daily. Solo se lee para importarlo a la base de datos.
import { z } from "zod";
import type { IsoDate } from "./dates";
import {
  HABIT_KINDS,
  scheduleSchema,
  timeSchema,
  type Habit,
  type HabitHistory,
  type HabitValue,
} from "./habits";
import { linkTarget } from "./links";

const noteHabitSchema = z.object({
  key: z.string(),
  name: z.string(),
  kind: z.enum(HABIT_KINDS).default("check"),
  target: z.number().positive().optional(),
  minimum: z.number().positive().optional(),
  unit: z.string().optional(),
  schedule: scheduleSchema.default("daily"),
  area: z.string().optional(),
  goal: z.string().optional(),
  start: timeSchema.optional(),
  end: timeSchema.optional(),
  started: z.coerce.string().optional(),
  until: z.coerce.string().optional(),
  archived: z.boolean().default(false),
});

/**
 * El hábito de una nota, con el área por su nombre, y el nombre de la nota de su objetivo
 * (al importar se cambia por su id). Si la nota está mal escrita, nada.
 */
export function parseNoteHabit(
  data: Record<string, unknown>,
): { habit: Habit; goal?: string } | undefined {
  const parsed = noteHabitSchema.safeParse(data);
  if (!parsed.success) return undefined;
  const { goal, ...habit } = parsed.data;
  return { habit: { ...habit, area: linkTarget(habit.area) }, goal: linkTarget(goal) };
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
