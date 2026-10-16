import type { NodeProps } from "@xyflow/react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowHandles } from "./FlowHandles";
import { ModuleActions } from "./ModuleActions";
import { ModuleBadge } from "./ModuleBadge";
import { StateChip } from "./StateChip";
import type { ModuleFlowNode } from "./types";

export function ModuleNode({ data, selected }: NodeProps<ModuleFlowNode>) {
  const { module, state, progress, range, next, chips } = data;
  const skipped = module.status === "skipped";

  return (
    <div
      className={cn(
        "group relative flex size-full flex-col justify-between rounded-[10px] border bg-card p-3.5 shadow-card transition-colors duration-(--dur-fast)",
        state === "current" && "border-primary",
        selected && state !== "current" && "border-foreground/40",
        skipped && "opacity-50",
      )}
    >
      <FlowHandles />
      <div className="flex items-start gap-2.5">
        <ModuleBadge module={module} state={state} progress={progress} />
        <div
          className={cn(
            "line-clamp-2 min-w-0 flex-1 text-[13px] leading-[18px] font-semibold",
            state === "idle" && "text-muted-foreground",
            skipped && "line-through",
          )}
        >
          {module.title}
        </div>
        <StateChip state={state} skipped={skipped} />
      </div>
      {range && (
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <CalendarIcon className="size-3 shrink-0" />
          <span>{range}</span>
          {next && <span className="truncate text-faint">· {next}</span>}
        </div>
      )}
      <div className="flex gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10.5px] leading-none text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
      <span className="h-1 overflow-hidden rounded-full bg-border">
        <span
          className={cn(
            "block h-full rounded-full",
            state === "mastered" ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </span>
      <ModuleActions data={data} />
    </div>
  );
}
