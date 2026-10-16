import type { NodeProps } from "@xyflow/react";
import type { AxisFlowNode } from "./types";

/** La columna de fechas: una línea vertical, una marca por fila y «HOY» donde estás. */
export function AxisNode({ data }: NodeProps<AxisFlowNode>) {
  const { ticks, todayY } = data;

  return (
    <div className="relative size-full">
      <span className="absolute inset-y-0 right-3 w-px bg-border" />
      {ticks.map(({ y, label }) => (
        <span
          key={y}
          className="absolute right-0 flex -translate-y-1/2 items-center gap-1.5 font-mono text-[11px] text-faint"
          style={{ top: y }}
        >
          {label}
          <span className="h-px w-1.5 bg-input" />
        </span>
      ))}
      {todayY !== undefined && (
        <span
          className="absolute inset-x-0 flex -translate-y-1/2 items-center"
          style={{ top: todayY }}
        >
          <span className="rounded-full bg-primary px-3 font-mono text-[10px] leading-5 font-semibold text-primary-foreground">
            HOY
          </span>
          <span className="h-[1.4px] flex-1 bg-primary/60" />
        </span>
      )}
    </div>
  );
}
