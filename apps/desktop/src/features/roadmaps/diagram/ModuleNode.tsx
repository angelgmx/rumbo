import type { NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { FlowHandles } from "./FlowHandles";
import { ModuleBadge } from "./ModuleBadge";
import type { ModuleFlowNode } from "./types";

export function ModuleNode({ data, selected }: NodeProps<ModuleFlowNode>) {
  const { module, state, progress, meta } = data;
  const skipped = module.status === "skipped";

  return (
    <div
      className={cn(
        "relative flex size-full flex-col justify-between rounded-lg border bg-card p-3.5 shadow-card transition-colors duration-(--dur-fast)",
        state === "current" && "border-primary",
        selected && state !== "current" && "border-foreground/40",
        skipped && "opacity-50",
      )}
    >
      <FlowHandles />
      <div className="flex items-start gap-3">
        <ModuleBadge module={module} state={state} progress={progress} />
        <div
          className={cn(
            "line-clamp-2 min-w-0 flex-1 text-sm leading-[18px] font-semibold",
            state === "idle" && "text-muted-foreground",
            skipped && "line-through",
          )}
        >
          {module.title}
        </div>
        {state === "current" && (
          <span className="rounded-sm bg-primary px-1.5 font-mono text-[10px] leading-[18px] font-semibold tracking-wide text-primary-foreground">
            AHORA
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] text-faint">{meta}</span>
        <span className="h-1 overflow-hidden rounded-full bg-border">
          <span
            className={cn(
              "block h-full rounded-full",
              state === "mastered" ? "bg-success" : "bg-primary",
            )}
            style={{ width: `${progress * 100}%` }}
          />
        </span>
      </div>
    </div>
  );
}
