import type { Priority, Task } from "@rumbo/core";
import { ClockIcon, FileTextIcon, FolderKanbanIcon, RepeatIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AreaDot } from "./AreaDot";
import { StepsChip } from "./StepsChip";
import { areaOf, projectOf } from "./taskFilters";
import { noteName, PRIORITY_LABEL } from "./taskLabels";

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "border-destructive/40 bg-destructive/10 text-destructive",
  medium: "border-warning/40 bg-warning/10 text-warning",
  low: "border-border text-muted-foreground",
};

/**
 * Una tarea en la lista: casilla, título y, a la derecha, columnas alineadas
 * (proyecto, área, prioridad, fecha y contador) para leerlas de un vistazo.
 */
export function TaskRow({
  task,
  today,
  showSource = false,
  showDate = true,
  onToggle,
  onOpen,
}: {
  task: Task;
  today: string;
  /** Debajo del título, la nota de donde viene (en el Inbox). */
  showSource?: boolean;
  /** Si la lista ya está agrupada por día, la fecha sobra. */
  showDate?: boolean;
  onToggle: (done: boolean) => void;
  onOpen: () => void;
}) {
  const date = task.scheduled ?? task.due;
  const late = !task.done && date !== undefined && date < today;
  const area = areaOf(task);
  const project = projectOf(task);

  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors duration-(--dur-fast) hover:bg-muted/40">
      <Checkbox
        checked={task.done}
        onCheckedChange={(checked) => onToggle(checked === true)}
        aria-label={task.text}
      />
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
      >
        <span className={cn("truncate", task.done && "text-muted-foreground line-through")}>
          {task.text}
        </span>
        {showSource && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileTextIcon className="size-3" />
            {noteName(task.path)}
          </span>
        )}
      </button>

      <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground">
        {project && (
          <span className="flex w-36 items-center gap-1.5 truncate">
            <FolderKanbanIcon className="size-3.5 shrink-0" />
            <span className="truncate">{project}</span>
          </span>
        )}
        {area && (
          <span className="flex w-28 items-center gap-1.5 truncate">
            <AreaDot area={area} />
            <span className="truncate">{area}</span>
          </span>
        )}
        {task.priority && (
          <span
            className={cn("rounded-md border px-1.5 py-0.5 text-xs", PRIORITY_STYLE[task.priority])}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
        {task.recurrence && <RepeatIcon className="size-3.5" aria-label={task.recurrence} />}
        {showDate && date && (
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-xs",
              late && "text-destructive",
            )}
          >
            <ClockIcon className="size-3.5" />
            {task.due && !task.scheduled ? "vence " : ""}
            {formatShortDay(date)}
          </span>
        )}
        <StepsChip steps={task.steps} />
      </div>
    </div>
  );
}
