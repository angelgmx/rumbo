import type { Task } from "@rumbo/core";
import { CalendarIcon, ClockIcon, FlagIcon, FolderKanbanIcon, RepeatIcon } from "lucide-react";
import { formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AreaDot } from "./AreaDot";
import { MetaItem } from "./MetaItem";
import { StepsChip } from "./StepsChip";
import { projectOf } from "./taskFilters";
import { FLAG_COLOR, PRIORITY_LABEL } from "./taskLabels";
import { useProjectTitle } from "./useProjectTitle";

// El rojo de «vencida» se oscurece (en claro) o se aclara (en oscuro) hasta pasar AA en texto de 12px.
const LATE = "text-[color-mix(in_oklab,var(--destructive),var(--foreground)_30%)]";

/**
 * La línea bajo el título de una tarea: proyecto, área, fecha y hora, repetición, prioridad
 * y pasos, cada uno con su icono y su nombre en el tooltip.
 */
export function TaskMeta({
  task,
  today,
  showDate,
}: {
  task: Task;
  today: string;
  /** Si la lista ya está agrupada por día, la fecha sobra y solo queda la hora. */
  showDate: boolean;
}) {
  const projectTitle = useProjectTitle();
  const project = projectOf(task);
  const date = task.scheduled ?? task.due;
  const late = !task.done && date !== undefined && date < today;
  const dueOnly = task.due !== undefined && task.scheduled === undefined;
  const dateLabel = date && showDate ? formatShortDay(date) : undefined;
  const when = [dateLabel, task.time].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground empty:hidden">
      {project && (
        <MetaItem label="Proyecto">
          <FolderKanbanIcon className="size-3.5 shrink-0" />
          <span className="max-w-40 truncate">{projectTitle(project)}</span>
        </MetaItem>
      )}
      {task.area && (
        <MetaItem label="Área">
          <AreaDot area={task.area} />
          <span className="max-w-32 truncate">{task.area}</span>
        </MetaItem>
      )}
      {when && (
        <MetaItem
          label={late ? "Vencida" : dueOnly ? "Fecha límite" : "Fecha y hora"}
          className={cn("tabular-nums", late && LATE)}
        >
          {dateLabel ? (
            <CalendarIcon className="size-3.5 shrink-0" />
          ) : (
            <ClockIcon className="size-3.5 shrink-0" />
          )}
          {dueOnly && dateLabel ? `vence ${when}` : when}
        </MetaItem>
      )}
      {task.recurrence && (
        <MetaItem label={`Se repite: ${task.recurrence}`}>
          <RepeatIcon className="size-3.5" aria-label={task.recurrence} />
        </MetaItem>
      )}
      {task.priority && (
        <MetaItem label={`Prioridad ${PRIORITY_LABEL[task.priority].toLowerCase()}`}>
          <FlagIcon
            className={cn("size-3.5 fill-current", FLAG_COLOR[task.priority])}
            aria-label={PRIORITY_LABEL[task.priority]}
          />
        </MetaItem>
      )}
      <StepsChip steps={task.steps} />
    </div>
  );
}
