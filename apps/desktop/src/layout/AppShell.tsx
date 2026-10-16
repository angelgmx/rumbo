import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { duration, ease } from "@/lib/motion";
import { NavRail } from "./NavRail";

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  // Solo la primera parte de la ruta: cambiar de vista dentro de Tareas no debe repetir la entrada.
  const screen = location.split("/")[1];

  return (
    <div className="flex h-svh bg-surface">
      <NavRail />
      <div className="my-2 mr-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background">
        <motion.div
          key={screen}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.page, ease: ease.enter }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
