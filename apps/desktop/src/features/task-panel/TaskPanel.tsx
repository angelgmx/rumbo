import type { Task } from "@rumbo/core";
import { CreateTaskPanel } from "./CreateTaskPanel";
import { EditTaskPanel } from "./EditTaskPanel";

/** El contenido del panel de tarea: con `task` edita esa; sin ella, crea una nueva. */
export function TaskPanel({
  task,
  onClose,
  onOpen,
}: {
  task: Task | undefined;
  onClose: () => void;
  onOpen: (task: Task) => void;
}) {
  return task ? (
    <EditTaskPanel task={task} onClose={onClose} onOpen={onOpen} />
  ) : (
    <CreateTaskPanel onClose={onClose} />
  );
}
