import type { Task } from "@rumbo/core";
import { PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { OrganizeAside } from "@/features/task-organizer/OrganizeAside";
import { taskRequest } from "@/features/session/requests";
import { useSession } from "@/features/session/SessionProvider";
import { CompleteButton } from "./CompleteButton";
import { CompletionSummary } from "./CompletionSummary";
import { TaskMenu } from "./TaskMenu";
import { TaskPanelBody } from "./TaskPanelBody";
import { TaskPanelHeader } from "./TaskPanelHeader";
import { useAutosavedTask } from "./useAutosavedTask";
import { useTaskCompletion } from "./useTaskCompletion";
import { useTaskContext } from "./useTaskContext";
import { useTaskOptions } from "./useTaskOptions";

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
  const session = useSession();
  const names = useTaskOptions();
  const completion = useTaskCompletion(task, names, flush);

  async function attempt(action: () => Promise<void>) {
    try {
      await action();
    } catch {
      toast.error("No se ha podido guardar el cambio");
    }
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

  const inFocus = task.focusOn === rumbo.daily.today();
  const toggleFocus = () =>
    attempt(async () => {
      const done = await rumbo.tasks.setFocus(task, !inFocus);
      if (!done) toast("El foco de hoy ya tiene 3 tareas");
    });

  function begin() {
    flush();
    session.start(taskRequest(rumbo, task));
    onClose();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TaskPanelHeader context={context} last={context.module} onClose={onClose}>
        {!task.done && (
          <CompleteButton
            thinking={completion.thinking}
            onClick={() => void completion.request()}
          />
        )}
        <TaskMenu
          inFocus={inFocus}
          onToggleFocus={() => void toggleFocus()}
          onDuplicate={() => void duplicate()}
          onDelete={() => void remove()}
        />
      </TaskPanelHeader>
      <div className="flex justify-end px-6 pb-3 empty:hidden">
        <OrganizeAside task={task} />
      </div>
      <TaskPanelBody
        draft={draft}
        context={context}
        status={{
          done: task.done,
          onChange: (done) => void attempt(() => rumbo.tasks.setDone(task, done)),
        }}
        creating={false}
        banner={
          completion.suggestion && (
            <CompletionSummary
              suggestion={completion.suggestion}
              names={names}
              onApply={() => void completion.apply(completion.suggestion!)}
              onDiscard={completion.discard}
            />
          )
        }
        onPatch={patch}
        onTitleChange={(text) => patch({ text })}
      />
      {!task.done && (
        <footer className="flex justify-end border-t px-6 py-4">
          <Button onClick={begin}>
            <PlayIcon data-icon="inline-start" />
            Empezar
          </Button>
        </footer>
      )}
    </div>
  );
}
