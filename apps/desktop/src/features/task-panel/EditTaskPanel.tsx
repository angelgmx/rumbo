import type { Task, TaskDraft } from "@rumbo/core";
import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { CounterControl } from "@/features/counters/CounterControl";
import { hasCounter } from "@/features/counters/countedTask";
import { TaskMenu } from "./TaskMenu";
import { TaskPanelBody } from "./TaskPanelBody";
import { TaskPanelHeader } from "./TaskPanelHeader";
import { useAutosavedTask } from "./useAutosavedTask";
import { useTaskContext } from "./useTaskContext";

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
  const context = useTaskContext(draft);
  const [started, setStarted] = useState(false);

  async function attempt(action: () => Promise<void>) {
    try {
      await action();
    } catch {
      toast.error("No se ha podido guardar el cambio");
    }
  }

  // El contador se guarda al momento y no con el resto: lo mueven también el cronómetro y el pomodoro.
  function change(changes: Partial<TaskDraft>) {
    const { counter, ...rest } = changes;
    if ("counter" in changes) void attempt(() => rumbo.tasks.setCounter(task, counter));
    if (Object.keys(rest).length > 0) patch(rest);
  }

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

  const timed =
    hasCounter(task) && (task.counter.kind === "minutes" || task.counter.kind === "pomodoro");
  const live = started && timed;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TaskPanelHeader context={context} last={context.module} onClose={onClose}>
        <TaskMenu onDuplicate={() => void duplicate()} onDelete={() => void remove()} />
      </TaskPanelHeader>
      <TaskPanelBody
        draft={draft}
        context={context}
        status={{
          done: task.done,
          onChange: (done) => void attempt(() => rumbo.tasks.setDone(task, done)),
        }}
        creating={false}
        live={live && <CounterControl task={task} autoStart />}
        onPatch={change}
        onTitleChange={(text) => patch({ text })}
      />
      {timed && !started && (
        <footer className="flex justify-end border-t px-6 py-4">
          <Button onClick={() => setStarted(true)}>
            <PlayIcon data-icon="inline-start" />
            Empezar
          </Button>
        </footer>
      )}
    </div>
  );
}
