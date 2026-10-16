import type { CounterKind } from "@rumbo/core";
import {
  CheckIcon,
  ClockIcon,
  Tally5Icon,
  TimerIcon,
  ToggleLeftIcon,
  type LucideIcon,
} from "lucide-react";

/** Cada forma de medir una tarea, con lo que necesita la interfaz para enseñarla. */
export interface CounterKindInfo {
  label: string;
  hint: string;
  icon: LucideIcon;
  /** Cómo se llama el objetivo al configurarlo. */
  targetLabel: string;
  /** Lo que se cuenta, detrás del objetivo: «/ 30 min». */
  unit: string;
  defaultTarget: number;
}

export const COUNTER_INFO: Record<CounterKind, CounterKindInfo> = {
  minutes: {
    label: "Minutos",
    hint: "cronómetro",
    icon: ClockIcon,
    targetLabel: "Minutos",
    unit: "min",
    defaultTarget: 30,
  },
  pomodoro: {
    label: "Pomodoro",
    hint: "ciclos",
    icon: TimerIcon,
    targetLabel: "Ciclos",
    unit: "ciclos",
    defaultTarget: 4,
  },
  count: {
    label: "Contador",
    hint: "+1 / −1",
    icon: Tally5Icon,
    targetLabel: "Objetivo",
    unit: "",
    defaultTarget: 8,
  },
  progress: {
    label: "Progreso",
    hint: "partes",
    icon: ToggleLeftIcon,
    targetLabel: "Partes",
    unit: "partes",
    defaultTarget: 3,
  },
};

/** La tarea sin contador: se marca hecha y ya. */
export const NO_COUNTER = { label: "Ninguno", hint: "casilla", icon: CheckIcon } as const;
