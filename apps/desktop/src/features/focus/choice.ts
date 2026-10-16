import {
  DEFAULT_SESSION_MINUTES,
  type HabitSummary,
  type Rumbo,
  type StartChoice,
  type Task,
} from "@rumbo/core";
import { moduleRequest, taskRequest } from "@/features/session/requests";
import type { SessionPlace, SessionRequest } from "@/features/session/types";
import { formatMinutes } from "@/lib/format";
import type { DayStep, NextStep } from "./useFocusDay";

export type FocusChoice = StartChoice<DayStep, Task, HabitSummary, NextStep>;

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

/** «Foco 01»: el puesto de la tarea elegida en el foco del día, si está en él. */
export function focusNumber(choice: FocusChoice | undefined, focus: Task[]): string | undefined {
  if (choice?.kind !== "task") return undefined;
  const index = focus.findIndex(
    ({ path, line }) => path === choice.task.path && line === choice.task.line,
  );
  return index === -1 ? undefined : formatFocusNumber(index);
}

export function formatFocusNumber(index: number): string {
  return `Foco ${String(index + 1).padStart(2, "0")}`;
}

/**
 * La sesión de lo elegido. Un bloque de rutina dura lo que queda de él; un hábito de tiempo,
 * su objetivo; una tarea, lo que dice su contador; y si no hay nada, el tiempo por defecto.
 */
export function choiceRequest(
  rumbo: Rumbo,
  choice: FocusChoice,
  minutesLeftInStep: number,
): SessionRequest {
  switch (choice.kind) {
    case "routine-step":
      return {
        title: choice.step.title,
        minutes: minutesLeftInStep,
        place: routineStepPlace(rumbo, choice.step),
      };
    case "task":
      return taskRequest(rumbo, choice.task);
    case "habit": {
      const { habit } = choice.habit;
      const target = habit.kind === "duration" ? habit.target : undefined;
      return { title: habit.name, minutes: target ?? DEFAULT_SESSION_MINUTES };
    }
    case "next-step": {
      const { topic } = choice.step;
      const module = topic.roadmap?.current;
      return module
        ? moduleRequest(topic, module)
        : { title: choice.step.module, minutes: DEFAULT_SESSION_MINUTES };
    }
  }
}

/** Un bloque de tema se trabaja en su módulo; los demás bloques, donde estés. */
function routineStepPlace(rumbo: Rumbo, step: DayStep): SessionPlace | undefined {
  const block = step.summary.routine.blocks[step.index];
  const module = block?.kind === "module" ? rumbo.routines.moduleFor(block)?.module : undefined;
  const found = module && rumbo.learning.findModule(module.name);
  return found && { topic: found.topic.path, module: found.module.name };
}
