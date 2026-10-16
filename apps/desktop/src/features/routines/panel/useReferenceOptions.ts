import type { BlockKind } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import type { PropertyOption } from "@/components/panel/OptionList";

/** A qué puede apuntar un bloque de hábito o de tema; los demás tipos no apuntan a nada. */
export function useReferenceOptions(kind: BlockKind): PropertyOption[] {
  const rumbo = useRumbo();

  if (kind === "habit") {
    return rumbo.habits.list().map(({ habit }) => ({ value: habit.key, label: habit.name }));
  }
  if (kind === "module") {
    return rumbo.learning.roadmaps().flatMap((roadmap) => [
      { value: `[[${roadmap.name}]]`, label: `Sigue «${roadmap.title}»`, hint: "ruta" },
      ...roadmap.modules.map((module) => ({
        value: `[[${module.name}]]`,
        label: `${String(module.order).padStart(2, "0")} · ${module.title}`,
        hint: roadmap.title,
      })),
    ]);
  }
  return [];
}
