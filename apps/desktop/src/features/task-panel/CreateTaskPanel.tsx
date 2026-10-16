import { useState, type KeyboardEvent } from "react";
import { CreateTaskFooter } from "./CreateTaskFooter";
import { TaskPanelBody } from "./TaskPanelBody";
import { TaskPanelHeader } from "./TaskPanelHeader";
import { useNewTask } from "./useNewTask";

/** El panel en modo crear. Con «Crear otra» se queda abierto con una tarea en blanco. */
export function CreateTaskPanel({ onClose }: { onClose: () => void }) {
  const [round, setRound] = useState(0);
  const [another, setAnother] = useState(false);

  return (
    <NewTaskForm
      key={round}
      another={another}
      onAnotherChange={setAnother}
      onCreated={() => (another ? setRound(round + 1) : onClose())}
    />
  );
}

function NewTaskForm({
  another,
  onAnotherChange,
  onCreated,
}: {
  another: boolean;
  onAnotherChange: (another: boolean) => void;
  onCreated: () => void;
}) {
  const task = useNewTask(onCreated);

  // Ctrl Enter crea desde cualquier campo, también desde los pasos y las propiedades.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && task.canCreate) {
      event.preventDefault();
      void task.create();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      <TaskPanelHeader title="Nueva tarea" />
      <TaskPanelBody
        draft={task.draft}
        status={undefined}
        creating
        onPatch={task.patch}
        onTitleChange={task.typeTitle}
        onTitleBlur={task.finishTitle}
      />
      <CreateTaskFooter
        another={another}
        canCreate={task.canCreate}
        onAnotherChange={onAnotherChange}
        onCreate={() => void task.create()}
      />
    </div>
  );
}
