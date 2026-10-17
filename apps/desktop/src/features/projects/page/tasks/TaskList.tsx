import { FlagIcon } from "lucide-react";
import { type TaskStatus, taskStatus } from "@rumbo/core";
import { ChevronRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { AddField } from "@/components/AddField";
import { cn } from "@/lib/utils";
import { TASK_STATUS_ICON, TASK_STATUS_LABEL } from "../../projectLabels";
import { TASK_COLUMNS, TaskRow } from "./TaskRow";
import type { TaskViewProps } from "./TaskViewProps";

/** En el orden en que se leen: lo que se está haciendo, lo que falta y, plegado, lo hecho. */
const GROUPS: TaskStatus[] = ["doing", "todo", "done"];
const COLUMNS = ["Tarea", "Hito", "Estado", "Cuándo", "Pasos"];

/** Las tareas en una tabla agrupada por estado, cada grupo con su campo para crear. */
export function TaskList({ tasks, milestones, onCreate }: TaskViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div
        className={cn(
          TASK_COLUMNS,
          "min-h-10 bg-muted/30 text-sm font-medium text-muted-foreground",
        )}
      >
        {COLUMNS.map((column) => (
          <span key={column}>{column}</span>
        ))}
        <FlagIcon aria-label="Prioridad" className="size-4" />
      </div>
      {GROUPS.map((status) => (
        <TaskGroup
          key={status}
          status={status}
          tasks={tasks.filter((task) => taskStatus(task) === status)}
          milestones={milestones}
          onCreate={onCreate(status)}
        />
      ))}
    </div>
  );
}

function TaskGroup({
  status,
  tasks,
  milestones,
  onCreate,
}: {
  status: TaskStatus;
  tasks: TaskViewProps["tasks"];
  milestones: TaskViewProps["milestones"];
  onCreate: (text: string) => void;
}) {
  const [open, setOpen] = useState(status !== "done");
  const { icon: Icon, style } = TASK_STATUS_ICON[status];
  const label = TASK_STATUS_LABEL[status];

  return (
    <section className="border-t">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center gap-2 px-4 text-sm outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
      >
        <ChevronRightIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-(--dur-fast)",
            open && "rotate-90",
          )}
        />
        <Icon className={cn("size-4", style)} />
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{tasks.length}</span>
      </button>
      {open && (
        <>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} milestones={milestones} />
          ))}
          <div className="border-t p-2">
            <div className="rounded-lg border">
              <AddField
                icon={PlusIcon}
                label={`Nueva tarea en ${label}`}
                placeholder={`Escribe una tarea en «${label}»…`}
                onCreate={onCreate}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
