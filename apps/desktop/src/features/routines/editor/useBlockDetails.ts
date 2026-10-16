import {
  blockTitle,
  linkTarget,
  type HabitSummary,
  type ModuleSummary,
  type RoadmapSummary,
  type RoutineBlock,
  type RoutineSummary,
} from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { STATUS_LABEL } from "@/features/roadmaps/moduleStatus";

interface BlockDetails {
  title: string;
  subtitle: string;
  habit?: HabitSummary;
  module?: ModuleSummary;
  roadmap?: RoadmapSummary;
  /** El bloque apunta a la ruta entera: cada día toca el tema que esté en curso. */
  followsRoadmap: boolean;
}

/** Lo que se enseña de un bloque: su nombre real y una línea con a qué apunta. */
export function useBlockDetails(summary: RoutineSummary, block: RoutineBlock): BlockDetails {
  const rumbo = useRumbo();

  if (block.kind === "habit") {
    const key = rumbo.store.findByName(linkTarget(block.ref) ?? "")?.data.key;
    const habit = summary.habits.find((item) => item.habit.key === key);
    return {
      title: block.title ?? habit?.habit.name ?? blockTitle(block),
      subtitle: habit ? habitGoal(habit) : "Hábito",
      habit,
      followsRoadmap: false,
    };
  }

  if (block.kind === "module") {
    const found = rumbo.routines.moduleFor(block);
    if (!found)
      return { title: blockTitle(block), subtitle: "Tema sin encontrar", followsRoadmap: false };
    const { roadmap, module } = found;
    const followsRoadmap = linkTarget(block.ref) === roadmap.name;
    return {
      title: block.title ?? module.title,
      subtitle: `${roadmap.title} · módulo ${String(module.order).padStart(2, "0")} · ${STATUS_LABEL[module.status].toLowerCase()}`,
      module,
      roadmap,
      followsRoadmap,
    };
  }

  if (block.kind === "break") {
    return {
      title: blockTitle(block),
      subtitle: "Sin pantalla · agua · estirar",
      followsRoadmap: false,
    };
  }
  if (block.kind === "task") {
    return { title: blockTitle(block), subtitle: "Tarea", followsRoadmap: false };
  }
  return { title: blockTitle(block) || "Bloque libre", subtitle: "", followsRoadmap: false };
}

function habitGoal({ habit }: HabitSummary): string {
  if (!habit.target) return "Hecho o no";
  return `${habit.target} ${habit.unit ?? ""} al día`.replace("  ", " ");
}
