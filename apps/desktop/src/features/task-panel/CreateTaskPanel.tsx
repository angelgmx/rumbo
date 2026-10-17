import { useState, type KeyboardEvent } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { useRumbo } from "@/app/RumboContext";
import { CreateTaskFooter } from "./CreateTaskFooter";
import { TaskPanelBody } from "./TaskPanelBody";
import { TaskPanelHeader } from "./TaskPanelHeader";
import { EMPTY_DRAFT } from "./taskDraft";
import { useNewTask } from "./useNewTask";
import { useTaskContext } from "./useTaskContext";

/** El panel en modo crear. Con «Crear otra» se queda abierto con una tarea en blanco. */
export function CreateTaskPanel({ onClose }: { onClose: () => void }) {
  const [round, setRound] = useState(0);
  const [another, setAnother] = useState(false);

  return (
    <NewTaskForm
      key={round}
      another={another}
      onAnotherChange={setAnother}
      onClose={onClose}
      onCreated={() => (another ? setRound(round + 1) : onClose())}
    />
  );
}

function NewTaskForm({
  another,
  onAnotherChange,
  onClose,
  onCreated,
}: {
  another: boolean;
  onAnotherChange: (another: boolean) => void;
  onClose: () => void;
  onCreated: () => void;
}) {
  const task = useNewTask(onCreated, useStartingDraft());
  const context = useTaskContext(task.draft);

  // Ctrl Enter crea desde cualquier campo, también desde los pasos y las propiedades.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && task.canCreate) {
      event.preventDefault();
      void task.create();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      <TaskPanelHeader context={context} last="Nueva tarea" onClose={onClose} />
      <TaskPanelBody
        draft={task.draft}
        context={context}
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

// Lo que se crea desde Foco o desde Tareas › Hoy es para hoy: si no, se perdería en el inbox.
// Lo que se crea desde la página de un proyecto es de ese proyecto.
const TODAY_SCREENS = ["/", "/tareas/hoy"];

// El panel vive fuera del router de la app, que va por «#»: la pantalla se lee de ahí.
const PROJECT_PAGE = /^\/proyectos\/(\d+)$/;

function useStartingDraft() {
  const rumbo = useRumbo();
  const [location] = useHashLocation();
  const project = PROJECT_PAGE.exec(location)?.[1];
  if (project) return { ...EMPTY_DRAFT, projectId: Number(project) };
  return TODAY_SCREENS.includes(location)
    ? { ...EMPTY_DRAFT, scheduled: rumbo.daily.today() }
    : EMPTY_DRAFT;
}
