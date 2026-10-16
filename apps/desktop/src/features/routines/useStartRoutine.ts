import type { RoutineSummary } from "@rumbo/core";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";

/**
 * Empezar una rutina: crea las tareas de hoy de sus bloques de tema y lleva a Foco,
 * donde ya está todo en orden. Las tareas que ya existían no se repiten.
 */
export function useStartRoutine() {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();

  return async (summary: RoutineSummary) => {
    let created = 0;
    for (const [index, block] of summary.routine.blocks.entries()) {
      if (block.kind !== "module") continue;
      created += (await rumbo.routines.planBlock(summary, index)).length;
    }
    toast.success(
      created > 0
        ? `${summary.title}: ${created} ${created === 1 ? "tarea" : "tareas"} para hoy`
        : `${summary.title}: ya tenías sus tareas de hoy`,
    );
    navigate("/");
  };
}
