import type { Habit } from "../src/domain/habits";

/** Un hábito para los tests: de sí o no, diario y activo salvo que se diga otra cosa. */
export function makeHabit(fields: Partial<Habit> & Pick<Habit, "key" | "name">): Habit {
  return { kind: "check", schedule: "daily", archived: false, ...fields };
}
