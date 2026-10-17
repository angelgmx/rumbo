import type { Task, TaskDraft } from "@rumbo/core";
import { CreateTaskPanel } from "./CreateTaskPanel";
import { EditTaskPanel } from "./EditTaskPanel";

/** El contenido del panel de tarea: con `task` edita esa; sin ella, crea una nueva a partir de `draft`. */
export function TaskPanel({
  task,
  draft,
  onClose,
  onOpen,
}: {
  task: Task | undefined;
  draft: TaskDraft | undefined;
  onClose: () => void;
  onOpen: (task: Task) => void;
}) {
  return task ? (
    <EditTaskPanel task={task} onClose={onClose} onOpen={onOpen} />
  ) : (
    <CreateTaskPanel draft={draft} onClose={onClose} />
  );
}
