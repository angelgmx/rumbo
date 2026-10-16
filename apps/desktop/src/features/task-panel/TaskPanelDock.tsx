import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { duration, ease } from "@/lib/motion";
import { TaskPanel } from "./TaskPanel";
import { panelKey, useTaskPanel } from "./TaskPanelProvider";

const PANEL_WIDTH = 520;
// El ancho de la columna incluye el margen de 8 px a cada lado que lo separa del borde.
const COLUMN_WIDTH = PANEL_WIDTH + 16;

/**
 * El panel de tarea fijo como columna a la derecha, algo suelto del borde para que se note.
 * Entra y sale deslizándose mientras la lista se estrecha; se anima el ancho y el
 * desplazamiento, no la opacidad, que en WebKitGTK hace parpadear la ventana.
 */
export function TaskPanelDock() {
  const { target, close, edit, dock } = useTaskPanel();

  useEffect(() => {
    dock(true);
    return () => dock(false);
  }, [dock]);

  return (
    <AnimatePresence initial={false}>
      {target && (
        <motion.div
          key="task-panel"
          className="shrink-0 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: COLUMN_WIDTH }}
          exit={{ width: 0 }}
          transition={{ duration: duration.slow, ease: ease.emphasis }}
        >
          <motion.aside
            aria-label="Detalle de la tarea"
            className="m-2 flex h-[calc(100%-1rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-card"
            style={{ width: PANEL_WIDTH }}
            initial={{ x: 48 }}
            animate={{ x: 0 }}
            exit={{ x: 48 }}
            transition={{ duration: duration.slow, ease: ease.emphasis }}
          >
            <TaskPanel key={panelKey(target)} task={target.task} onClose={close} onOpen={edit} />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
