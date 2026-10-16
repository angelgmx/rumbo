import type { Task } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { formatRelativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Una tarea del árbol: se marca con su casilla y al pulsarla se abre su panel. */
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
        className="min-w-0 flex-1 truncate text-left hover:underline"
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
    </div>
  );
}
