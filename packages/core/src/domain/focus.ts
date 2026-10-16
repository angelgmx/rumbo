import { keepsStreak, type Habit, type HabitValue, type Streak } from "./habits";

// Lo que decide la pantalla Foco, sin tocar el vault: qué toca empezar y qué racha corre peligro.

/** Desde cuántos días seguidos una racha merece un aviso. */
const RISK_STREAK_DAYS = 3;

export interface RiskCandidate {
  habit: Habit;
  streak: Streak;
  today?: HabitValue;
  doneToday: boolean;
}

/**
 * Hábitos con una racha de días que hoy se perdería: no están cumplidos ni en su versión
 * mínima. Un día malo no pierde nada, así que ese día no hay nada en riesgo.
 */
export function streaksAtRisk<T extends RiskCandidate>(habits: T[], badDay: boolean): T[] {
  if (badDay) return [];
  return habits
    .filter(
      ({ habit, streak, today, doneToday }) =>
        streak.unit === "days" &&
        streak.count >= RISK_STREAK_DAYS &&
        !doneToday &&
        !keepsStreak(habit, today),
    )
    .sort((a, b) => b.streak.count - a.streak.count);
}

interface RoutineStepLike {
  routine: string;
  start: string;
  end: string;
  done: boolean;
}

export type StartChoice<S, T, H, P> =
  | { kind: "routine-step"; step: S; reason: string }
  | { kind: "task"; task: T; reason: string }
  | { kind: "habit"; habit: H; reason: string }
  | { kind: "next-step"; step: P; reason: string };

interface StartCandidates<S, T, H, P> {
  /** "HH:MM" de ahora. */
  time: string;
  /** Los pasos de las rutinas de hoy, en orden de hora. */
  steps: S[];
  /** Las tareas del foco de hoy, en su orden. */
  focus: T[];
  /** Hábitos con la racha en riesgo, la más larga primero. */
  atRisk: H[];
  /** El siguiente paso de la ruta que estás estudiando. */
  nextStep?: P;
}

/**
 * Lo que toca empezar, con un orden fijo para que siempre se pueda explicar:
 * el paso de rutina en curso, la primera tarea del foco, el hábito con la racha
 * en riesgo y el siguiente paso de tu ruta. Con cada elección va su porqué.
 */
export function chooseStart<
  S extends RoutineStepLike,
  T extends { done: boolean },
  H extends { habit: { name: string }; streak: { count: number } },
  P extends { roadmap: string },
>(input: StartCandidates<S, T, H, P>): StartChoice<S, T, H, P> | undefined {
  const step = input.steps.find((s) => !s.done && s.start <= input.time && input.time < s.end);
  if (step) return { kind: "routine-step", step, reason: `Bloque actual de «${step.routine}»` };

  const task = input.focus.find((t) => !t.done);
  if (task) return { kind: "task", task, reason: "Es la primera tarea de tu foco de hoy" };

  const risk = input.atRisk[0];
  if (risk) {
    return {
      kind: "habit",
      habit: risk,
      reason: `Tu racha de ${risk.streak.count} días en ${risk.habit.name} está en riesgo`,
    };
  }

  if (input.nextStep) {
    return {
      kind: "next-step",
      step: input.nextStep,
      reason: `Es lo siguiente de tu ruta «${input.nextStep.roadmap}»`,
    };
  }
  return undefined;
}
