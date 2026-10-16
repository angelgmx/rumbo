import type { Task } from "@rumbo/core";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TaskPanel } from "./TaskPanel";
import { panelKey, type PanelTarget } from "./TaskPanelProvider";

// Flota a 8 px de los bordes y entra deslizándose, igual que la columna de Tareas.
// Solo se anima el desplazamiento: la opacidad hace parpadear a WebKitGTK.
const FLOATING =
  "gap-0 p-0 duration-(--dur-slow) ease-(--ease-emphasis) data-starting-style:opacity-100 data-ending-style:opacity-100 data-[side=right]:inset-y-2 data-[side=right]:right-2 data-[side=right]:h-auto data-[side=right]:w-[calc(100%-1rem)] data-[side=right]:rounded-xl data-[side=right]:border data-[side=right]:shadow-card data-[side=right]:sm:max-w-[520px] data-[side=right]:data-starting-style:translate-x-[110%] data-[side=right]:data-ending-style:translate-x-[110%]";

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
    <Sheet open={target !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent showCloseButton={false} className={FLOATING}>
        <SheetTitle className="sr-only">{shown?.task ? "Tarea" : "Nueva tarea"}</SheetTitle>
        {shown && (
          <TaskPanel key={panelKey(shown)} task={shown.task} onClose={onClose} onOpen={onOpen} />
        )}
      </SheetContent>
    </Sheet>
  );
}
