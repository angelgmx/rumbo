import type { Task } from "@rumbo/core";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { TaskWindow } from "./TaskWindow";

interface TaskWindowApi {
  create: () => void;
  edit: (task: Task) => void;
}

const TaskWindowContext = createContext<TaskWindowApi>({ create: () => {}, edit: () => {} });

export function useTaskWindow(): TaskWindowApi {
  return useContext(TaskWindowContext);
}

/** Guarda la ventana de tarea para toda la app: se abre con Ctrl N o desde cualquier botón. */
export function TaskWindowProvider({ children }: { children: ReactNode }) {
  // `undefined` es cerrada; `{}` es una tarea nueva; `{ task }`, editar esa.
  const [target, setTarget] = useState<{ task?: Task }>();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setTarget((open) => open ?? {});
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <TaskWindowContext value={{ create: () => setTarget({}), edit: (task) => setTarget({ task }) }}>
      {children}
      <Dialog open={target !== undefined} onOpenChange={(open) => !open && setTarget(undefined)}>
        {target && <TaskWindow task={target.task} onClose={() => setTarget(undefined)} />}
      </Dialog>
    </TaskWindowContext>
  );
}
