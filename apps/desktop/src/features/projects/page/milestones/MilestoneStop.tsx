import type { Milestone, StepCount } from "@rumbo/core";
import { CheckIcon, Trash2Icon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { InlineTitle } from "@/components/InlineTitle";
import { DayPicker } from "@/components/panel/DayPicker";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { Button } from "@/components/ui/button";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

export type StopPlace = "first" | "middle" | "last";

/** Los píxeles de medio círculo: la línea empieza y acaba en el centro del primero y del último. */
export const STOP_RADIUS = 10;

/** El punto de la línea de tiempo con dónde cae en ella, de 0 a 1. */
export const stopLeft = (fraction: number) =>
  `calc(${STOP_RADIUS}px + (100% - ${STOP_RADIUS * 2}px) * ${fraction})`;

const LABEL_PLACE: Record<StopPlace, string> = {
  first: "left-0 items-start text-left",
  middle: "-translate-x-1/2 items-center text-center",
  last: "right-0 items-end text-right",
};

/**
 * Un hito de la línea de tiempo: el círculo lo marca o lo reabre; debajo, su nombre, su fecha
 * (que se cambia donde se lee, o se quita el hito) y cuántas de sus tareas están hechas.
 */
export function MilestoneStop({
  projectId,
  milestone,
  place,
  fraction,
  next,
  tasks,
}: {
  projectId: number;
  milestone: Milestone;
  place: StopPlace;
  fraction: number;
  next: boolean;
  tasks: StepCount;
}) {
  const { projects } = useRumbo();
  const { id, title, date, done } = milestone;

  return (
    <>
      <button
        type="button"
        aria-pressed={done}
        aria-label={title}
        onClick={() => void projects.setMilestone(projectId, id, !done)}
        style={{ left: stopLeft(fraction) }}
        className={cn(
          "absolute top-5 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          done && "border-success bg-success text-card",
          next && "border-primary",
          !done && !next && "border-border",
        )}
      >
        {done && <CheckIcon className="size-3 stroke-[3]" />}
        {next && <span className="size-2 rounded-full bg-primary" />}
      </button>
      <div
        style={place === "middle" ? { left: stopLeft(fraction) } : undefined}
        className={cn("absolute top-12 flex w-44 flex-col gap-0.5", LABEL_PLACE[place])}
      >
        <InlineTitle
          label={`Nombre del hito ${title}`}
          value={title}
          onSave={(name) => void projects.renameMilestone(projectId, id, name)}
          className={cn(
            "max-w-full truncate px-1 py-0.5 text-sm",
            next ? "font-semibold" : done ? "text-muted-foreground" : "text-foreground/80",
          )}
        />
        <span
          className={cn(
            "flex items-center font-mono text-xs whitespace-nowrap text-muted-foreground",
            next && "text-primary-text",
          )}
        >
          <PropertyPopover
            label={`Fecha de ${title}`}
            width="w-auto p-1"
            className="h-6 rounded-md px-1"
            trigger={date ? formatDayMonth(date) : "Sin fecha"}
          >
            {(close) => (
              <>
                <DayPicker
                  date={date}
                  onChange={(value) => void projects.setMilestoneDate(projectId, id, value)}
                  onDone={close}
                />
                <Button
                  variant="ghost"
                  className="justify-start text-destructive"
                  onClick={() => void projects.removeMilestone(projectId, id)}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Quitar hito
                </Button>
              </>
            )}
          </PropertyPopover>
          <span>· {tasks.total === 0 ? "sin tareas" : `${tasks.done}/${tasks.total} tareas`}</span>
        </span>
      </div>
    </>
  );
}
