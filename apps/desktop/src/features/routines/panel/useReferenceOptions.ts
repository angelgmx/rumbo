import type { BlockKind } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import type { PropertyOption } from "@/components/panel/OptionList";
import { formatDayMonth } from "@/lib/format";

/** A qué puede apuntar un bloque de hábito, de ruta o de tarea; los demás no apuntan a nada. */
export function useReferenceOptions(kind: BlockKind): PropertyOption[] {
  const rumbo = useRumbo();

  if (kind === "habit") {
    return rumbo.habits.list().map(({ habit }) => ({ value: habit.key, label: habit.name }));
  }
  if (kind === "module") {
    return rumbo.learning
      .roadmaps()
      .map((roadmap) => ({ value: `[[${roadmap.name}]]`, label: roadmap.title }));
  }
  if (kind === "task") {
    return rumbo.tasks
      .all()
      .filter((task) => !task.done)
      .map((task) => ({
        value: String(task.id),
        label: task.text,
        hint: task.scheduled && formatDayMonth(task.scheduled),
      }));
  }
  return [];
}
