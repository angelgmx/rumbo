import type { NodeProps } from "@xyflow/react";
import { FlowHandles } from "./FlowHandles";
import type { TrackFlowNode } from "./types";

/** La cabecera de una pista: su nombre, lo que lleva y lo que ya has hecho. */
export function TrackNode({ data }: NodeProps<TrackFlowNode>) {
  const { label, meta, progress } = data;

  return (
    <div className="relative flex size-full items-center justify-between gap-3 overflow-hidden rounded-lg border bg-secondary px-3.5">
      <FlowHandles />
      <span className="truncate font-mono text-[10.5px] tracking-[0.09em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="shrink-0 font-mono text-[11px] text-faint">{meta}</span>
      <span
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
