import type { GoalSummary } from "@rumbo/core";
import { GoalDetailHeader } from "./GoalDetailHeader";
import { GoalProgressLine } from "./GoalProgressLine";
import { GoalProperties } from "./GoalProperties";
import { GoalTitle } from "./GoalTitle";
import { GoalPath } from "./path/GoalPath";

/** El objetivo abierto: cada cambio se guarda al momento, sin botón. */
export function GoalDetail({ summary, onClose }: { summary: GoalSummary; onClose: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <GoalDetailHeader summary={summary} onClose={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-8">
        <GoalTitle summary={summary} />
        <GoalProperties summary={summary} />
        <GoalProgressLine summary={summary} />
        <GoalPath summary={summary} />
      </div>
    </div>
  );
}
