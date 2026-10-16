import type { Priority, TaskDraft } from "@rumbo/core";
import { GaugeIcon } from "lucide-react";
import { PanelSection } from "@/components/panel/PanelSection";
import { EstimateProperty } from "./EstimateProperty";
import { OptionProperty } from "./OptionProperty";
import { PRIORITIES } from "./taskChoices";

/** Cuánto pesa la tarea: su prioridad y lo que calculas que llevará frente a lo que lleva. */
export function EffortGroup({
  draft,
  taskId,
  onChange,
}: {
  draft: TaskDraft;
  taskId: number | undefined;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <PanelSection title="Esfuerzo" icon={GaugeIcon}>
      <OptionProperty
        label="Prioridad"
        clearLabel="Sin prioridad"
        empty="Elegir prioridad"
        value={draft.priority}
        options={PRIORITIES}
        onChange={(priority) => onChange({ priority: priority as Priority | undefined })}
      />
      <EstimateProperty
        draft={draft}
        taskId={taskId}
        onChange={(duration) => onChange({ duration })}
      />
    </PanelSection>
  );
}
