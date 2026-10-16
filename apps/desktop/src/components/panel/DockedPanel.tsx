import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { duration, ease } from "@/lib/motion";

const PANEL_WIDTH = 520;
// El ancho de la columna incluye el margen de 8 px a cada lado que lo separa del borde.
const COLUMN_WIDTH = PANEL_WIDTH + 16;

/**
 * Un panel fijo como columna a la derecha, algo suelto del borde para que se note.
 * Entra y sale deslizándose mientras el contenido se estrecha; se anima el ancho y el
 * desplazamiento, no la opacidad, que en WebKitGTK hace parpadear la ventana.
 */
export function DockedPanel({
  open,
  label,
  children,
}: {
  open: boolean;
  /** Para los lectores de pantalla. */
  label: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="docked-panel"
          className="shrink-0 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: COLUMN_WIDTH }}
          exit={{ width: 0 }}
          transition={{ duration: duration.slow, ease: ease.emphasis }}
        >
          <motion.aside
            aria-label={label}
            className="m-2 flex h-[calc(100%-1rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-card"
            style={{ width: PANEL_WIDTH }}
            initial={{ x: 48 }}
            animate={{ x: 0 }}
            exit={{ x: 48 }}
            transition={{ duration: duration.slow, ease: ease.emphasis }}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
