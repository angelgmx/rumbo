import type { HabitSummary, StartChoice, Task } from "@rumbo/core";
import { formatMinutes } from "@/lib/format";
import type { DayStep, NextStep } from "./useFocusDay";

export type FocusChoice = StartChoice<DayStep, Task, HabitSummary, NextStep>;

export const DEFAULT_FOCUS_MINUTES = 50;
export const QUICK_MINUTES = 5;

/** Cómo se cuenta lo elegido en la tarjeta «Ahora». */
export function describeChoice(choice: FocusChoice): { title: string; subtitle: string } {
  switch (choice.kind) {
    case "routine-step":
      return {
        title: choice.step.title,
        subtitle: `${choice.step.routine} · ${formatMinutes(choice.step.minutes)}`,
      };
    case "task":
      return { title: choice.task.text, subtitle: "Foco de hoy" };
    case "habit":
      return {
        title: choice.habit.habit.name,
        subtitle: `Racha de ${choice.habit.streak.count} días`,
      };
    case "next-step":
      return { title: choice.step.module, subtitle: choice.step.roadmap };
  }
}

/** Cuánto dura lo elegido: lo que queda del bloque, el objetivo del hábito o el foco por defecto. */
export function choiceMinutes(choice: FocusChoice, minutesLeftInStep: number): number {
  if (choice.kind === "routine-step") return minutesLeftInStep;
  if (choice.kind === "habit" && choice.habit.habit.kind === "duration") {
    return choice.habit.habit.target ?? DEFAULT_FOCUS_MINUTES;
  }
  return DEFAULT_FOCUS_MINUTES;
}
