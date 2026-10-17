import type { Priority, Task } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { PRIORITIES } from "@/features/task-panel/taskChoices";
import { FLAG_COLOR, PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { cn } from "@/lib/utils";

/** La bandera de prioridad de una tarea: de su color si la tiene, apagada si no; al pulsarla se cambia. */
export function PriorityFlag({ task }: { task: Task }) {
  const { tasks } = useRumbo();
  const { priority } = task;

  return (
    <PropertyPopover
      label={priority ? `Prioridad ${PRIORITY_LABEL[priority].toLowerCase()}` : "Prioridad"}
      width="w-44"
      className="size-7 shrink-0 justify-center rounded-md"
      trigger={
        <FlagIcon
          className={cn(
            "size-4",
            priority ? `fill-current ${FLAG_COLOR[priority]}` : "text-muted-foreground/60",
          )}
        />
      }
    >
      {(close) => (
        <OptionList
          options={PRIORITIES}
          value={priority}
          clearLabel="Sin prioridad"
          onChoose={(next) => {
            void tasks.update(task, { priority: next as Priority | undefined });
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
