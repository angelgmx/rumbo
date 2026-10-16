import type { Task } from "@rumbo/core";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";
import { TaskPanel } from "./TaskPanel";

interface TaskPanelApi {
  create: () => void;
  edit: (task: Task) => void;
}

const TaskPanelContext = createContext<TaskPanelApi>({ create: () => {}, edit: () => {} });

export function useTaskPanel(): TaskPanelApi {
  return useContext(TaskPanelContext);
}

/** Guarda el panel de tarea para toda la app: se abre con Ctrl N o desde cualquier botón. */
export function TaskPanelProvider({ children }: { children: ReactNode }) {
  // `undefined` es cerrado; `{}` es una tarea nueva; `{ task }`, editar esa.
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

  const edit = (task: Task) => setTarget({ task });

  return (
    <TaskPanelContext value={{ create: () => setTarget({}), edit }}>
      {children}
      <Sheet open={target !== undefined} onOpenChange={(open) => !open && setTarget(undefined)}>
        {target && (
          <TaskPanel
            key={target.task ? `${target.task.path}:${target.task.line}` : "new"}
            task={target.task}
            onClose={() => setTarget(undefined)}
            onOpen={edit}
          />
        )}
      </Sheet>
    </TaskPanelContext>
  );
}
