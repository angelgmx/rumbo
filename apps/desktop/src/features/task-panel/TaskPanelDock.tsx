import { useEffect } from "react";
import { TaskPanel } from "./TaskPanel";
import { panelKey, useTaskPanel } from "./TaskPanelProvider";

/** El panel de tarea fijo como columna a la derecha, algo suelto del borde para que se note. */
export function TaskPanelDock() {
  const { target, close, edit, dock } = useTaskPanel();

  useEffect(() => {
    dock(true);
    return () => dock(false);
  }, [dock]);

  if (!target) return null;

  return (
    <aside
      aria-label="Detalle de la tarea"
      className="m-2 flex w-[520px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card shadow-card"
    >
      <TaskPanel key={panelKey(target)} task={target.task} onClose={close} onOpen={edit} />
    </aside>
  );
}
