import type { Task } from "@rumbo/core";
import { useState } from "react";
import { SidePanel } from "@/components/panel/SidePanel";
import { TaskPanel } from "./TaskPanel";
import { panelKey, type PanelTarget } from "./TaskPanelProvider";

/**
 * El panel de tarea como hoja lateral, para las pantallas que no tienen sitio para él.
 * Siempre montada: así anima al abrir y al cerrar. Al cerrar sigue enseñando la última
 * tarea mientras sale, en vez de quedarse vacía.
 */
export function TaskSheet({
  target,
  onClose,
  onOpen,
}: {
  target: PanelTarget;
  onClose: () => void;
  onOpen: (task: Task) => void;
}) {
  const [shown, setShown] = useState(target);
  if (target && target !== shown) setShown(target);

  return (
    <SidePanel
      open={target !== undefined}
      title={shown?.task ? "Tarea" : "Nueva tarea"}
      onClose={onClose}
    >
      {shown && (
        <TaskPanel
          key={panelKey(shown)}
          task={shown.task}
          draft={shown.draft}
          onClose={onClose}
          onOpen={onOpen}
        />
      )}
    </SidePanel>
  );
}
