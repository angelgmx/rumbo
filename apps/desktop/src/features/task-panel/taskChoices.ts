import { PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import type { PropertyOption } from "@/components/panel/OptionList";

/** Las duraciones que se eligen de un clic. */
export const QUICK_DURATIONS = [15, 30, 45, 60, 120];

export const REPEATS: PropertyOption[] = [
  { value: "every day", label: "Cada día" },
  { value: "every week", label: "Cada semana" },
  { value: "every month", label: "Cada mes" },
];

export const PRIORITIES: PropertyOption[] = (["high", "medium", "low"] as const).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));
