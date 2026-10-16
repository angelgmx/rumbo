import { PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { formatMinutes } from "@/lib/format";
import type { PropertyOption } from "./OptionList";

const DURATIONS = [15, 30, 45, 60, 90, 120];

export const REPEATS: PropertyOption[] = [
  { value: "every day", label: "Cada día" },
  { value: "every week", label: "Cada semana" },
  { value: "every month", label: "Cada mes" },
];

export const PRIORITIES: PropertyOption[] = (["high", "medium", "low"] as const).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));

export const STATUSES: PropertyOption[] = [
  { value: "pending", label: "Pendiente" },
  { value: "done", label: "Hecha" },
];

/** Las duraciones de siempre y, si la tarea trae otra, también esa. */
export function durationOptions(current: number | undefined): PropertyOption[] {
  const minutes =
    current && !DURATIONS.includes(current)
      ? [...DURATIONS, current].sort((a, b) => a - b)
      : DURATIONS;
  return minutes.map((value) => ({ value: String(value), label: formatMinutes(value) }));
}
