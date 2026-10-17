import type { Milestone, Task } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { cn } from "@/lib/utils";
import { PriorityFlag } from "./PriorityFlag";
import { StepsCount } from "./StepsCount";
import { TaskCheckbox } from "./TaskCheckbox";
import { TaskDate } from "./TaskDate";
import { TaskStatusPicker } from "./TaskStatusPicker";

export const TASK_COLUMNS =
  "grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_6.5rem_9.5rem_4rem_2rem] items-center gap-4 border-l-2 border-l-transparent px-5";

/** Una tarea en la lista: casilla y título (abre su panel), hito, estado, cuándo, pasos y prioridad. */
export function TaskRow({ task, milestones }: { task: Task; milestones: Milestone[] }) {
  const panel = useTaskPanel();
  const milestone = milestones.find(({ id }) => id === task.milestoneId);
  const selected = panel.target?.task?.id === task.id;

  return (
    <div
      className={cn(
        TASK_COLUMNS,
        "min-h-12 border-t",
        selected && "border-l-primary bg-primary-soft/60",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <TaskCheckbox task={task} />
        <button
          type="button"
          onClick={() => panel.edit(task)}
          className={cn(
            "min-w-0 truncate rounded-sm text-left text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            task.done && "text-muted-foreground line-through",
          )}
        >
          {task.text}
        </button>
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        {milestone && (
          <>
            <FlagIcon className="size-3.5 shrink-0" />
            <span className="truncate">{milestone.title}</span>
          </>
        )}
      </span>
      <TaskStatusPicker task={task} />
      <TaskDate task={task} />
      <StepsCount steps={task.steps} />
      <PriorityFlag task={task} />
    </div>
  );
}
