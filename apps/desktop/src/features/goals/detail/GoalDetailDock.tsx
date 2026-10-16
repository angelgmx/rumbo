import type { GoalSummary } from "@rumbo/core";
import { DockedPanel } from "@/components/panel/DockedPanel";
import { GoalDetail } from "./GoalDetail";

/** El panel del objetivo abierto, fijo a la derecha de la lista. */
export function GoalDetailDock({
  summary,
  onClose,
}: {
  summary: GoalSummary | undefined;
  onClose: () => void;
}) {
  return (
    <DockedPanel open={summary !== undefined} label="Detalle del objetivo">
      {summary && <GoalDetail key={summary.id} summary={summary} onClose={onClose} />}
    </DockedPanel>
  );
}
