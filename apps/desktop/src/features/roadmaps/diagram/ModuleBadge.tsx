import { CheckIcon } from "lucide-react";
import type { ModuleSummary } from "@rumbo/core";
import type { ModuleState } from "./types";

const RADIUS = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ModuleBadgeProps {
  module: ModuleSummary;
  state: ModuleState;
  progress: number;
}

/** El círculo de 28 px del módulo: check, anillo de progreso, número destacado o número tenue. */
export function ModuleBadge({ module, state, progress }: ModuleBadgeProps) {
  const number = String(module.order).padStart(2, "0");

  if (state === "mastered") {
    return (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/16 text-success">
        <CheckIcon className="size-4" strokeWidth={2.4} />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-[#ff7a4f] to-primary font-mono text-[11px] font-medium text-white">
        {number}
      </span>
    );
  }

  if (state === "learning") {
    return (
      <span className="relative grid size-7 shrink-0 place-items-center font-mono text-[11px] text-foreground">
        <svg viewBox="0 0 28 28" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle
            cx="14"
            cy="14"
            r={RADIUS}
            fill="none"
            strokeWidth="2.2"
            className="stroke-input"
          />
          <circle
            cx="14"
            cy="14"
            r={RADIUS}
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-primary"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - Math.max(progress, 0.12))}
          />
        </svg>
        {number}
      </span>
    );
  }

  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[11px] text-faint">
      {number}
    </span>
  );
}
