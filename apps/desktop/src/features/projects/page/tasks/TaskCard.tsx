import type { Milestone, Task } from "@rumbo/core";
import { FlagIcon, GripVerticalIcon } from "lucide-react";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { cn } from "@/lib/utils";
import { PriorityFlag } from "./PriorityFlag";
import { StepsCount } from "./StepsCount";
import { TaskCheckbox } from "./TaskCheckbox";
import { TaskDate } from "./TaskDate";

/** Una tarea en el tablero: casilla, título (abre su panel), prioridad, hito, cuándo y pasos. */
export function TaskCard({
  task,
  milestones,
  className,
}: {
  task: Task;
  milestones: Milestone[];
  className?: string;
}) {
  const panel = useTaskPanel();
  const milestone = milestones.find(({ id }) => id === task.milestoneId);
  const selected = panel.target?.task?.id === task.id;

  return (
    <article
      className={cn(
        "flex gap-1 rounded-lg border bg-card p-3 pl-1.5 shadow-card",
        selected && "border-primary bg-primary-soft/40",
        className,
      )}
    >
      <GripVerticalIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex">
            <TaskCheckbox task={task} />
          </span>
          <button
            type="button"
            onClick={() => panel.edit(task)}
            className={cn(
              "min-w-0 flex-1 rounded-sm text-left text-[14.5px] leading-snug font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              task.done && "text-muted-foreground line-through",
            )}
          >
            {task.text}
          </button>
          <PriorityFlag task={task} />
        </div>
        {milestone && (
          <span className="flex items-center gap-1.5 pl-6.5 text-sm text-muted-foreground">
            <FlagIcon className="size-3.5 shrink-0" />
            <span className="truncate">{milestone.title}</span>
          </span>
        )}
        <div className="flex items-center gap-3 pl-6.5 empty:hidden">
          <TaskDate task={task} />
          <StepsCount steps={task.steps} />
        </div>
      </div>
    </article>
  );
}
