import type { ModuleSummary } from "@rumbo/core";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleState } from "./types";

const RADIUS = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ModuleBadgeProps {
  module: ModuleSummary;
  state: ModuleState;
  progress: number;
}

/** El círculo de 28 px del módulo: check si está dominado o, si no, su número con el anillo de progreso. */
export function ModuleBadge({ module, state, progress }: ModuleBadgeProps) {
  if (state === "mastered") {
    return (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/16 text-success">
        <CheckIcon className="size-4" strokeWidth={2.4} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative grid size-7 shrink-0 place-items-center font-mono text-[11px]",
        state === "idle" ? "text-faint" : "font-semibold text-foreground",
      )}
    >
      <svg viewBox="0 0 28 28" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="14" cy="14" r={RADIUS} fill="none" strokeWidth="2.2" className="stroke-input" />
        <circle
          cx="14"
          cy="14"
          r={RADIUS}
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
      {String(module.order).padStart(2, "0")}
    </span>
  );
}
