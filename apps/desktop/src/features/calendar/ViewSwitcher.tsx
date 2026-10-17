import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { duration, ease } from "@/lib/motion";
import type { CalendarMode } from "./calendarView";

const ORDER: CalendarMode[] = ["day", "week", "month"];

// Solo desplazamiento: la opacidad de capas grandes parpadea en WebKitGTK.
const SLIDE = {
  enter: (direction: number) => ({ x: `${direction * 100}%` }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: `${direction * -100}%` }),
};

/** Cambia de vista deslizando: hacia la derecha si la nueva va después (Día → Semana → Mes). */
export function ViewSwitcher({ mode, children }: { mode: CalendarMode; children: ReactNode }) {
  const [last, setLast] = useState({ mode, direction: 1 });
  if (last.mode !== mode) {
    setLast({ mode, direction: ORDER.indexOf(mode) > ORDER.indexOf(last.mode) ? 1 : -1 });
  }
  const { direction } = last;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={mode}
          custom={direction}
          variants={SLIDE}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: duration.slow, ease: ease.emphasis }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
