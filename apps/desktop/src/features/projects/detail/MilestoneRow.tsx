import type { Milestone } from "@rumbo/core";
import { daysBetween } from "@rumbo/core";
import { CheckIcon, XIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { DayPicker } from "@/components/panel/DayPicker";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { Button } from "@/components/ui/button";
import { Tag } from "@/features/roadmaps/Tag";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { inDaysLabel } from "../projectLabels";

/**
 * Un hito en la línea del tiempo: el círculo lo marca o lo reabre; el siguiente por hacer lleva
 * anillo y los días que faltan. La fecha se cambia donde se lee.
 */
export function MilestoneRow({
  projectId,
  milestone,
  next,
}: {
  projectId: number;
  milestone: Milestone;
  next: boolean;
}) {
  const { projects, daily } = useRumbo();
  const { id, title, date, done } = milestone;

  return (
    <li className="group relative flex min-h-8 items-center gap-3 text-sm">
      <button
        type="button"
        aria-pressed={done}
        aria-label={title}
        onClick={() => void projects.setMilestone(projectId, id, !done)}
        className={cn(
          "relative z-10 flex size-4 shrink-0 items-center justify-center rounded-full border-2 bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          done && "border-success bg-success text-card",
          next && "border-primary",
          !done && !next && "border-border",
        )}
      >
        {done && <CheckIcon className="size-2.5 stroke-[3]" />}
        {next && <span className="size-1.5 rounded-full bg-primary" />}
      </button>
      <span
        className={cn("min-w-0 truncate", next && "font-medium", done && "text-muted-foreground")}
      >
        {title}
      </span>
      {next && date && (
        <Tag className="text-primary-text" dot>
          {inDaysLabel(daysBetween(daily.today(), date))}
        </Tag>
      )}
      <span className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Quitar ${title}`}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={() => void projects.removeMilestone(projectId, id)}
        >
          <XIcon />
        </Button>
        <PropertyPopover
          label={`Fecha de ${title}`}
          width="w-auto p-1"
          className="h-7 rounded-md px-2 font-mono text-muted-foreground"
          trigger={date ? formatDayMonth(date) : "Sin fecha"}
        >
          {(close) => (
            <DayPicker
              date={date}
              onChange={(value) => void projects.setMilestoneDate(projectId, id, value)}
              onDone={close}
            />
          )}
        </PropertyPopover>
      </span>
    </li>
  );
}
