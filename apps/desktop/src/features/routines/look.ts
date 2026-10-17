import type { BlockKind, Routine } from "@rumbo/core";
import {
  BookOpenIcon,
  CheckIcon,
  CoffeeIcon,
  FlameIcon,
  PencilIcon,
  type LucideIcon,
} from "lucide-react";
import { useArea, type AreaLook } from "@/hooks/useArea";

// Colores de las láminas para las rutinas sin área: así cada tipo se reconoce de un vistazo.
const KIND_LOOK: Record<Routine["kind"], Required<Pick<AreaLook, "color" | "icon">>> = {
  morning: { color: "#e9a23b", icon: "coffee" },
  afternoon: { color: "#e9a23b", icon: "sun" },
  evening: { color: "#d9668f", icon: "moon" },
  study: { color: "#5b8def", icon: "book-open" },
  gym: { color: "#2fb47c", icon: "dumbbell" },
  custom: { color: "#8b7cf6", icon: "repeat" },
};

/** Color e icono de una rutina: los de su área si tiene, y si no, los de su tipo. */
export function useRoutineLook(routine: Routine): AreaLook {
  const area = useArea(routine.area);
  const fallback = KIND_LOOK[routine.kind];
  return {
    name: area.name,
    color: routine.area ? area.color : fallback.color,
    icon: (routine.area && area.icon) || fallback.icon,
  };
}

export const BLOCK_KIND_LABEL: Record<BlockKind, string> = {
  habit: "Hábito",
  module: "Estudio de ruta",
  task: "Tarea",
  activity: "Actividad",
  break: "Descanso",
};

export const BLOCK_KIND_HINT: Record<BlockKind, string> = {
  habit: "Completar el bloque marca el hábito",
  module: "Toca el tema en curso y crea las tareas del día",
  task: "Una tarea que ya tienes",
  activity: "Café, estirar… lo que quieras",
  break: "Un respiro entre bloques",
};

export const BLOCK_KIND_ICON: Record<BlockKind, LucideIcon> = {
  habit: FlameIcon,
  module: BookOpenIcon,
  task: CheckIcon,
  activity: PencilIcon,
  break: CoffeeIcon,
};
