import { type TaskStatus, taskStatus } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { useRef } from "react";
import { useRumbo } from "@/app/RumboContext";
import { AddField } from "@/components/AddField";
import { ColumnHeading, StatusBoard } from "@/components/StatusBoard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TASK_STATUS_ICON, TASK_STATUS_LABEL } from "../../projectLabels";
import { TaskCard } from "./TaskCard";
import type { TaskViewProps } from "./TaskViewProps";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

/** Las tareas en tres columnas: arrastrar una a otra cambia su estado; cada columna tiene su campo para crear. */
export function TaskBoard({ tasks, milestones, onCreate }: TaskViewProps) {
  const rumbo = useRumbo();
  const fields = useRef<Partial<Record<TaskStatus, HTMLInputElement | null>>>({});

  return (
    <StatusBoard
      items={tasks}
      statusOf={taskStatus}
      columnClassName="min-w-60 flex-1"
      onMove={(task, status) => void rumbo.tasks.setStatus(task, status)}
      columns={STATUSES.map((status) => {
        const { icon: Icon, style } = TASK_STATUS_ICON[status];
        return {
          status,
          heading: (
            <ColumnHeading
              icon={<Icon className={cn("size-4", style)} />}
              title={TASK_STATUS_LABEL[status]}
              count={tasks.filter((task) => taskStatus(task) === status).length}
              action={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Nueva tarea en ${TASK_STATUS_LABEL[status]}`}
                  onClick={() => fields.current[status]?.focus()}
                >
                  <PlusIcon />
                </Button>
              }
            />
          ),
          footer: (
            <div className="rounded-lg border">
              <AddField
                icon={PlusIcon}
                label={`Nueva tarea en ${TASK_STATUS_LABEL[status]}`}
                placeholder="Escribe una tarea…"
                inputRef={(input) => {
                  fields.current[status] = input;
                }}
                onCreate={onCreate(status)}
              />
            </div>
          ),
        };
      })}
      renderCard={(task, className) => (
        <TaskCard task={task} milestones={milestones} className={className} />
      )}
    />
  );
}
