import type { NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { ModuleBadge } from "./ModuleBadge";
import { SideHandles } from "./SideHandles";
import type { ModuleFlowNode, ModuleState } from "./types";

const CARD_STYLE: Record<ModuleState, string> = {
  mastered: "border-success bg-[color-mix(in_srgb,var(--success)_6%,var(--card))]",
  learning: "border-input bg-linear-to-b from-popover to-card",
  current:
    "halo-primary border-[1.6px] border-primary bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))]",
  idle: "border-border bg-linear-to-b from-popover to-card",
};

export function ModuleNode({ data, selected }: NodeProps<ModuleFlowNode>) {
  const { module, state, progress, meta } = data;
  const skipped = module.status === "skipped";

  return (
    <div
      className={cn(
        "relative size-full rounded-xl border shadow-card transition-colors duration-(--dur-fast)",
        CARD_STYLE[state],
        selected && state !== "current" && "border-foreground/40",
        skipped && "opacity-50",
      )}
    >
      <SideHandles />
      <div className="absolute inset-x-4 top-4 flex items-start gap-3">
        <ModuleBadge module={module} state={state} progress={progress} />
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "truncate text-[14.5px] leading-[18px] font-semibold",
              state === "idle" && "text-muted-foreground",
              skipped && "line-through",
            )}
          >
            {module.title}
          </div>
          <div className="mt-1 font-mono text-[11.5px] text-faint">{meta}</div>
        </div>
        {state === "mastered" && <span className="text-[11px] text-success">Dominado</span>}
        {state === "current" && (
          <span className="rounded-sm bg-primary px-1.5 font-mono text-[10px] leading-[18px] font-semibold tracking-wide text-primary-foreground">
            AHORA
          </span>
        )}
      </div>
      <div className="absolute inset-x-4 bottom-[18px] h-1 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full", state === "mastered" ? "bg-success" : "bg-primary")}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
