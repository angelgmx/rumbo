import { useEffect } from "react";
import { DockedPanel } from "@/components/panel/DockedPanel";
import { TaskPanel } from "./TaskPanel";
import { panelKey, useTaskPanel } from "./TaskPanelProvider";

/** El panel de tarea fijo como columna a la derecha, para las pantallas que tienen sitio para él. */
export function TaskPanelDock() {
  const { target, close, edit, dock } = useTaskPanel();

  useEffect(() => {
    dock(true);
    return () => dock(false);
  }, [dock]);

  return (
    <DockedPanel open={target !== undefined} label="Detalle de la tarea">
      {target && (
        <TaskPanel key={panelKey(target)} task={target.task} onClose={close} onOpen={edit} />
      )}
    </DockedPanel>
  );
}
