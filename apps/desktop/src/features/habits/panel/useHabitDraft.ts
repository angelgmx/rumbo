import { minutesBetween, type Habit, type HabitInput } from "@rumbo/core";
import { useState } from "react";

const BLANK: HabitInput = { name: "", kind: "check", target: 20, schedule: "daily" };

/** Lo que se rellena en el panel, con lo que impide guardarlo (si algo lo impide). */
export function useHabitDraft(habit: Habit | undefined) {
  const [draft, setDraft] = useState<HabitInput>(habit ? inputOf(habit) : BLANK);
  const patch = (changes: Partial<HabitInput>) =>
    setDraft((current) => ({ ...current, ...changes }));
  return { draft, patch, reset: () => setDraft(BLANK), problem: problemOf(draft) };
}

function problemOf(draft: HabitInput): string | undefined {
  if (!draft.name.trim()) return "Ponle un nombre";
  const hasAmount = draft.kind === "count" || draft.kind === "duration";
  if (hasAmount && !(draft.target && draft.target > 0)) return "La meta tiene que ser mayor que 0";
  if (Array.isArray(draft.schedule) && draft.schedule.length === 0) return "Elige al menos un día";
  if (draft.start && draft.end && minutesBetween(draft.start, draft.end) <= 0)
    return "La hora de fin va después del inicio";
  return undefined;
}

function inputOf(habit: Habit): HabitInput {
  const { name, kind, target, unit, schedule, area, goal, icon, color, start, end, until } = habit;
  return { name, kind, target, unit, schedule, area, goal, icon, color, start, end, until };
}
