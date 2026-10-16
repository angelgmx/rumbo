import type { Task } from "@rumbo/core";
import type { ReactNode } from "react";
import { InboxIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TaskMeta } from "./TaskMeta";

/**
 * Una tarea en la lista: casilla, el título en una línea y, debajo, sus metadatos
 * (proyecto, área, fecha, prioridad y pasos) con icono cada uno.
 */
export function TaskRow({
  task,
  today,
  showCaptured = false,
  showDate = true,
  onToggle,
  onOpen,
  aside,
  menu,
}: {
  task: Task;
  today: string;
  /** Debajo del título, cuándo la capturaste (en el Inbox). */
  showCaptured?: boolean;
  /** Si la lista ya está agrupada por día, la fecha sobra. */
  showDate?: boolean;
  onToggle: (done: boolean) => void;
  onOpen: () => void;
  /** Algo más al final de la fila, como la propuesta de la IA. */
  aside?: ReactNode;
  /** El menú «…» de la fila. */
  menu?: ReactNode;
}) {
  return (
    <div className="group flex items-center gap-3 min-h-14 px-4 py-2.5 transition-colors duration-(--dur-fast) hover:bg-muted/40">
      <Checkbox
        checked={task.done}
        onCheckedChange={(checked) => onToggle(checked === true)}
        aria-label={task.text}
      />
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col gap-1 text-left"
      >
        <span
          title={task.text}
          className={cn(
            "truncate text-sm font-medium",
            task.done && "font-normal text-muted-foreground line-through",
          )}
        >
          {task.text}
        </span>
        <TaskMeta task={task} today={today} showDate={showDate} />
        {showCaptured && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <InboxIcon className="size-3" />
            Capturada el {formatDayMonth(task.created)}
          </span>
        )}
      </button>

      {aside}
      {menu}
    </div>
  );
}
