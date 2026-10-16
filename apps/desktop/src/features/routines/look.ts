import { type BlockKind, type Routine, type RoutineTemplate } from "@rumbo/core";
import {
  BookOpenIcon,
  CheckIcon,
  CoffeeIcon,
  FlameIcon,
  PencilIcon,
  type LucideIcon,
} from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
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

/** Color de un bloque: el del área de su hábito; los demás, el de la rutina o neutro. */
export function useBlockColor(kind: BlockKind, ref: string | undefined, routineColor: string) {
  const { routines } = useRumbo();
  const habitArea = kind === "habit" ? routines.habitOf(ref)?.area : undefined;
  const area = useArea(habitArea);

  if (kind === "habit") return habitArea ? area.color : routineColor;
  if (kind === "module" || kind === "task") return routineColor;
  return "var(--muted-foreground)";
}

export const BLOCK_KIND_LABEL: Record<BlockKind, string> = {
  habit: "Hábito",
  module: "Módulo",
  task: "Tarea",
  break: "Descanso",
  custom: "Libre",
};

export const BLOCK_KIND_ICON: Record<BlockKind, LucideIcon> = {
  habit: FlameIcon,
  module: BookOpenIcon,
  task: CheckIcon,
  break: CoffeeIcon,
  custom: PencilIcon,
};

/** Nombre corto de cada plantilla, como en la fila «Empieza con una plantilla». */
export const TEMPLATE_LABEL: Record<RoutineTemplate, string> = {
  morning: "Mañana",
  study: "Estudio",
  gym: "Gym",
  evening: "Noche",
  weekend: "Fin de semana",
};

/** Las plantillas no tienen tipo «fin de semana»: se pinta como una rutina libre. */
export function templateKind(template: RoutineTemplate): Routine["kind"] {
  return template === "weekend" ? "custom" : template;
}

/** Fondo rayado de los descansos, igual en la franja del día y en el editor. */
export const BREAK_PATTERN =
  "repeating-linear-gradient(135deg, color-mix(in oklab, var(--muted-foreground) 18%, transparent) 0 4px, transparent 4px 8px)";
