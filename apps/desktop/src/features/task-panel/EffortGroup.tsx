import type { Priority, TaskDraft } from "@rumbo/core";
import { PropertyGroup } from "@/components/panel/PropertyGroup";
import { EstimateProperty } from "./EstimateProperty";
import { OptionProperty } from "./OptionProperty";
import { PRIORITIES } from "./taskChoices";

/** Cuánto pesa la tarea: su prioridad y lo que calculas que llevará frente a lo que lleva. */
export function EffortGroup({
  draft,
  onChange,
}: {
  draft: TaskDraft;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <PropertyGroup title="Esfuerzo">
      <OptionProperty
        label="Prioridad"
        clearLabel="Sin prioridad"
        empty="Elegir prioridad"
        value={draft.priority}
        options={PRIORITIES}
        onChange={(priority) => onChange({ priority: priority as Priority | undefined })}
      />
      <EstimateProperty
        estimated={draft.duration}
        real={draft.spent}
        onChange={(duration) => onChange({ duration })}
      />
    </PropertyGroup>
  );
}
