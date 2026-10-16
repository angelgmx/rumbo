import type { GoalSummary } from "@rumbo/core";
import { ProgressRing } from "@/components/ProgressRing";
import { percent } from "./goalLabels";

/** El avance del objetivo con su anillo; sin nada que lo empuje, «Sin plan». */
export function GoalProgress({ progress }: Pick<GoalSummary, "progress">) {
  if (progress === undefined)
    return <span className="text-sm text-muted-foreground">Sin plan</span>;

  return (
    <span className="flex items-center gap-2 font-mono text-sm">
      <ProgressRing value={progress} color="var(--primary)" size={22} stroke={3} />
      {percent(progress)}
    </span>
  );
}
