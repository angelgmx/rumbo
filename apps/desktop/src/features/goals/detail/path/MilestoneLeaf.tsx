import type { Milestone } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Un hito del proyecto: la bandera lo marca como hecho o lo reabre. */
export function MilestoneLeaf({
  projectId,
  milestone,
}: {
  projectId: number;
  milestone: Milestone;
}) {
  const { projects } = useRumbo();

  return (
    <button
      type="button"
      aria-pressed={milestone.done}
      onClick={() => void projects.setMilestone(projectId, milestone.id, !milestone.done)}
      className="flex min-h-10 items-center gap-3 pl-1.5 text-left text-sm"
    >
      <FlagIcon
        className={cn("size-4 shrink-0", milestone.done ? "text-success" : "text-warning")}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          milestone.done && "text-muted-foreground line-through",
        )}
      >
        {milestone.title}
      </span>
      {milestone.date && (
        <span className="shrink-0 text-muted-foreground">{formatDayMonth(milestone.date)}</span>
      )}
    </button>
  );
}
