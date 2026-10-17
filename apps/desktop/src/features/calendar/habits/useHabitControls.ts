import { habitStep, isDone, type HabitSummary, type IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";

/** Apuntar un hábito un día desde el calendario: marcarlo, o sumar y restar su cantidad. */
export function useHabitControls(summary: HabitSummary, date: IsoDate) {
  const { habits } = useRumbo();
  const { habit } = summary;
  const value = summary.history.get(date);
  const amount = typeof value === "number" ? value : 0;
  const record = (next: boolean | number) => habits.setValue(habit.key, next, date);

  return {
    done: isDone(habit, value),
    amount,
    toggle: () => record(!isDone(habit, value)),
    step: (direction: 1 | -1) => record(Math.max(0, amount + direction * habitStep(habit))),
  };
}
