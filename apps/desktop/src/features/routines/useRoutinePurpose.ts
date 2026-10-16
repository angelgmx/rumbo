import type { RoutineSummary } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";

/** Para qué sirve la rutina, en una línea: «Avanza «Java desde cero»» o «Marca Inglés y Lectura». */
export function useRoutinePurpose(summary: RoutineSummary): string {
  const rumbo = useRumbo();
  const roadmaps = new Set(
    summary.routine.blocks
      .filter((block) => block.kind === "module")
      .map((block) => rumbo.routines.moduleFor(block)?.roadmap.title)
      .filter((title): title is string => title !== undefined),
  );
  const habits = summary.habits.map(({ habit }) => habit.name);

  if (roadmaps.size > 0) return `Avanza ${[...roadmaps].map((title) => `«${title}»`).join(" y ")}`;
  if (habits.length > 0) return `Marca ${joinNames(habits)}`;
  return `${summary.blocks.length} bloques`;
}

function joinNames(names: string[]): string {
  if (names.length === 1) return names[0]!;
  return `${names.slice(0, -1).join(", ")} y ${names.at(-1)}`;
}
