import { type Task, type TaskStatus, taskStatus } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { Tag } from "@/features/roadmaps/Tag";
import { TASK_STATUS_LABEL, TASK_STATUS_STYLE } from "../../projectLabels";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

/** El estado de una tarea como etiqueta, que se cambia donde se lee. */
export function TaskStatusPicker({ task }: { task: Task }) {
  const { tasks } = useRumbo();
  const status = taskStatus(task);

  return (
    <PropertyPopover
      label="Estado de la tarea"
      width="w-44"
      className="h-7 w-fit rounded-md"
      trigger={
        <Tag dot className={TASK_STATUS_STYLE[status]}>
          {TASK_STATUS_LABEL[status]}
        </Tag>
      }
    >
      {(close) => (
        <OptionList
          options={STATUSES.map((value) => ({ value, label: TASK_STATUS_LABEL[value] }))}
          value={status}
          onChoose={(next) => {
            if (next) void tasks.setStatus(task, next as TaskStatus);
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
