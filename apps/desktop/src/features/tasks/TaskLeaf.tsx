import type { Task } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { formatRelativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FLAG_COLOR } from "./taskLabels";

/** Una tarea dentro de otra vista (objetivo, proyecto): casilla, título, fecha y prioridad; al pulsarla se abre su panel. */
export function TaskLeaf({ task }: { task: Task }) {
  const rumbo = useRumbo();
  const panel = useTaskPanel();
  const today = rumbo.daily.today();
  const date = task.scheduled ?? task.due;

  return (
    <div className="flex min-h-10 items-center gap-3 pl-1.5 text-sm">
      <Checkbox
        checked={task.done}
        onCheckedChange={(checked) => void rumbo.tasks.setDone(task, checked === true)}
        aria-label={task.text}
      />
      <button
        type="button"
        onClick={() => panel.edit(task)}
        className={cn(
          "min-w-0 flex-1 truncate text-left hover:underline",
          task.done && "text-muted-foreground line-through",
        )}
      >
        {task.text}
      </button>
      {date && (
        <span
          className={cn("shrink-0 text-muted-foreground", date === today && "text-primary-text")}
        >
          {formatRelativeDay(date, today)}
        </span>
      )}
      {task.priority && (
        <FlagIcon
          aria-label="Prioridad"
          className={cn("size-4 shrink-0 fill-current", FLAG_COLOR[task.priority])}
        />
      )}
    </div>
  );
}
