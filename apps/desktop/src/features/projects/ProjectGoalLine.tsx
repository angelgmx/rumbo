import type { ProjectSummary } from "@rumbo/core";
import { TargetIcon } from "lucide-react";

/** El objetivo al que empuja el proyecto, o «Sin objetivo» apagado. */
export function ProjectGoalLine({ goal }: Pick<ProjectSummary, "goal">) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <TargetIcon className="size-4 shrink-0" />
      <span className="truncate">{goal ? goal.title : "Sin objetivo"}</span>
    </span>
  );
}
