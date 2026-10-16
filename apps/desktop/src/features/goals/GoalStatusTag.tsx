import type { GoalStatus } from "@rumbo/core";
import { Tag } from "@/features/roadmaps/Tag";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_STYLE } from "./goalLabels";

export function GoalStatusTag({ status, className }: { status: GoalStatus; className?: string }) {
  return (
    <Tag dot className={cn(STATUS_STYLE[status], className)}>
      {STATUS_LABEL[status]}
    </Tag>
  );
}
