import type { Task } from "@rumbo/core";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { TaskPanelBody } from "./TaskPanelBody";
import { TaskPanelHeader } from "./TaskPanelHeader";
import { useAutosavedTask } from "./useAutosavedTask";

/** El panel de una tarea que ya existe: cada cambio se guarda al momento, sin botón. */
export function EditTaskPanel({
  task: initial,
  onClose,
  onOpen,
}: {
  task: Task;
  onClose: () => void;
  /** Abre otra tarea en el mismo panel (la copia al duplicar). */
  onOpen: (task: Task) => void;
}) {
  const rumbo = useRumbo();
  const { task, draft, patch, flush } = useAutosavedTask(initial);

  async function attempt(action: () => Promise<void>) {
    try {
      await action();
    } catch {
      toast.error("No se ha podido guardar el cambio");
    }
  }

  const setDone = (done: boolean) => attempt(() => rumbo.tasks.setDone(task, done));

  const duplicate = () =>
    attempt(async () => {
      flush();
      const copy = await rumbo.tasks.duplicate(task);
      if (!copy) return;
      toast.success("Tarea duplicada");
      onOpen(copy);
    });

  const remove = () =>
    attempt(async () => {
      flush();
      await rumbo.tasks.remove(task);
      toast.success("Tarea eliminada");
      onClose();
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TaskPanelHeader title="Tarea">
        <Button variant="ghost" size="sm" onClick={() => void duplicate()}>
          <CopyIcon data-icon="inline-start" />
          Duplicar
        </Button>
        <DeleteTaskButton onConfirm={() => void remove()} />
      </TaskPanelHeader>
      <TaskPanelBody
        draft={draft}
        status={{ done: task.done, onChange: (done) => void setDone(done) }}
        creating={false}
        onPatch={patch}
        onTitleChange={(text) => patch({ text })}
      />
    </div>
  );
}
