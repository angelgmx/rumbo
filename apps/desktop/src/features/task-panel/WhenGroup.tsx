import type { TaskDraft } from "@rumbo/core";
import { DateRow } from "@/components/panel/DateRow";
import { CalendarIcon } from "lucide-react";
import { PanelSection } from "@/components/panel/PanelSection";
import { OptionProperty } from "./OptionProperty";
import { REPEATS } from "./taskChoices";
import { TimeProperty } from "./TimeProperty";

/** Cuándo se hace la tarea: el día que empieza, el que vence, la hora y si se repite. */
export function WhenGroup({
  draft,
  onChange,
}: {
  draft: TaskDraft;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <PanelSection title="Cuándo" icon={CalendarIcon}>
      <DateRow
        label="Empieza"
        empty="Añadir fecha"
        date={draft.scheduled}
        onChange={(scheduled) => onChange({ scheduled })}
      />
      <DateRow
        label="Vence"
        empty="Añadir fecha límite"
        date={draft.due}
        onChange={(due) => onChange({ due })}
      />
      {draft.scheduled && (
        <TimeProperty value={draft.time} onChange={(time) => onChange({ time })} />
      )}
      <OptionProperty
        label="Repite"
        clearLabel="No se repite"
        empty="No se repite"
        value={draft.recurrence}
        options={REPEATS}
        onChange={(recurrence) => onChange({ recurrence })}
      />
    </PanelSection>
  );
}
