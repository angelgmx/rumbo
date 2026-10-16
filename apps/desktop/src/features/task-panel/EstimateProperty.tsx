import type { TaskDraft } from "@rumbo/core";
import { FieldRow, ReadOnlyRow } from "@/components/panel/PropertyRow";
import { Progress } from "@/components/ui/progress";
import { formatMinutes } from "@/lib/format";
import { DurationChips } from "./DurationChips";
import { DurationHint } from "./DurationHint";
import { DurationInput } from "./DurationInput";

/** Lo que calculas que llevará (se escribe o se elige) y lo que lleva de verdad según las sesiones. */
export function EstimateProperty({
  draft,
  taskId,
  onChange,
}: {
  draft: TaskDraft;
  taskId: number | undefined;
  onChange: (duration: number | undefined) => void;
}) {
  const { duration, spent } = draft;

  return (
    <>
      <FieldRow label="Estimado">
        <DurationInput key={duration ?? "none"} value={duration} onCommit={onChange} />
        <DurationChips value={duration} onChoose={onChange} />
        <DurationHint draft={draft} taskId={taskId} />
      </FieldRow>
      <ReadOnlyRow label="Real">
        {spent ? (
          <>
            <span className="font-mono">{formatMinutes(spent)}</span>
            {duration ? (
              <Progress value={Math.min(spent / duration, 1) * 100} className="ml-auto max-w-40" />
            ) : null}
          </>
        ) : (
          <span className="text-muted-foreground/70">Sin sesiones todavía</span>
        )}
      </ReadOnlyRow>
    </>
  );
}
