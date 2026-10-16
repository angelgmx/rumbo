import type { HabitInput } from "@rumbo/core";
import {
  CircleCheckBigIcon,
  HashIcon,
  ListTodoIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react";

export type HabitKind = HabitInput["kind"];

export interface HabitKindInfo {
  value: HabitKind;
  title: string;
  description: string;
  example: string;
  icon: LucideIcon;
}

/** Las cuatro formas de cumplir un hábito, explicadas con un ejemplo. */
export const HABIT_KINDS: HabitKindInfo[] = [
  {
    value: "check",
    title: "Hecho o no",
    description: "Lo marcas cuando lo haces.",
    example: "Ir al gym",
    icon: CircleCheckBigIcon,
  },
  {
    value: "tasks",
    title: "Con tareas del día",
    description: "Se cumple al terminar las tareas de hoy.",
    example: "Programar: tema + ejercicios",
    icon: ListTodoIcon,
  },
  {
    value: "count",
    title: "Una cantidad",
    description: "Cuentas hasta llegar al objetivo.",
    example: "Leer 20 páginas",
    icon: HashIcon,
  },
  {
    value: "duration",
    title: "Un tiempo",
    description: "Sumas minutos hasta el objetivo.",
    example: "Meditar 10 min",
    icon: TimerIcon,
  },
];
