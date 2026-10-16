import type { Task } from "@rumbo/core";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { TaskSheet } from "./TaskSheet";

/** `undefined` es cerrado; `{}` es una tarea nueva; `{ task }`, editar esa. */
export type PanelTarget = { task?: Task } | undefined;

interface TaskPanelApi {
  create: () => void;
  edit: (task: Task) => void;
  target: PanelTarget;
  close: () => void;
  /** Una pantalla con sitio propio para el panel lo reclama mientras está en pantalla. */
  dock: (docked: boolean) => void;
}

const TaskPanelContext = createContext<TaskPanelApi>({
  create: () => {},
  edit: () => {},
  target: undefined,
  close: () => {},
  dock: () => {},
});

export function useTaskPanel(): TaskPanelApi {
  return useContext(TaskPanelContext);
}

/**
 * Guarda el panel de tarea para toda la app: se abre con Ctrl N o desde cualquier botón.
 * Sale como hoja lateral salvo que una pantalla lo tenga fijo en su sitio.
 */
export function TaskPanelProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<PanelTarget>();
  const [docked, setDocked] = useState(false);

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
  const close = () => setTarget(undefined);

  return (
    <TaskPanelContext value={{ create: () => setTarget({}), edit, target, close, dock: setDocked }}>
      {children}
      {target && !docked && (
        <TaskSheet key={panelKey(target)} task={target.task} onClose={close} onOpen={edit} />
      )}
    </TaskPanelContext>
  );
}

export function panelKey(target: { task?: Task }): string {
  return target.task ? `${target.task.path}:${target.task.line}` : "new";
}
