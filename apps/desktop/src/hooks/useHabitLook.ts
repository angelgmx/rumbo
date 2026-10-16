import type { Habit } from "@rumbo/core";
import { useArea, type AreaLook } from "./useArea";

/** Icono y color de un hábito: los suyos o, si no tiene, los de su área. */
export function useHabitLook(habit: Habit | undefined): AreaLook {
  const area = useArea(habit?.area);
  return {
    name: area.name,
    color: habit?.color ?? area.color,
    icon: habit?.icon ?? area.icon,
  };
}
