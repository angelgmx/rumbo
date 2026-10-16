import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleState } from "./types";

const CHIPS: Record<ModuleState, { label: string; className: string }> = {
  current: { label: "Ahora", className: "bg-primary text-primary-foreground" },
  mastered: { label: "Dominado", className: "bg-success/12 text-success" },
  learning: { label: "Aprendiendo", className: "bg-primary-soft text-primary-text" },
  idle: { label: "Sin empezar", className: "bg-secondary text-faint" },
};

interface StateChipProps {
  state: ModuleState;
  skipped: boolean;
}

export function StateChip({ state, skipped }: StateChipProps) {
  const { label, className } = skipped
    ? { label: "Saltado", className: CHIPS.idle.className }
    : CHIPS[state];

  return (
    <span
      className={cn(
        "flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-[10.5px] leading-none font-medium",
        className,
      )}
    >
      {state === "mastered" && !skipped && <CheckIcon className="size-3" strokeWidth={2.6} />}
      {label}
    </span>
  );
}
