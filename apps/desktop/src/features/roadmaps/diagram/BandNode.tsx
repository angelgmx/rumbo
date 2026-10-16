import type { NodeProps } from "@xyflow/react";
import { BAND_PADDING } from "./geometry";
import type { BandFlowNode } from "./types";

const HEADING = "font-mono text-[10.5px] tracking-[0.09em] uppercase";

/** El carril de una pista: cabecera, progreso y las líneas de los checkpoints que lo cruzan. */
export function BandNode({ data }: NodeProps<BandFlowNode>) {
  const { label, parallel, meta, progress, until, columns, rules } = data;

  return (
    <div className="relative size-full rounded-2xl border bg-background/55">
      {rules.map((y) => (
        <span
          key={y}
          className="absolute inset-x-0 border-t border-dashed border-warning/35"
          style={{ top: y }}
        />
      ))}
      <div
        className="absolute top-3 flex items-center gap-2 rounded-sm bg-background pr-2"
        style={{ left: BAND_PADDING }}
      >
        <span
          className={parallel ? `${HEADING} text-primary-text` : `${HEADING} text-muted-foreground`}
        >
          {label}
        </span>
        {meta && <span className="font-mono text-[11px] text-faint">{meta}</span>}
        {progress !== undefined && (
          <span className="h-1 w-[60px] overflow-hidden rounded-full bg-input">
            <span className="block h-full bg-primary" style={{ width: `${progress * 100}%` }} />
          </span>
        )}
      </div>
      {columns.map((column) => (
        <div
          key={column.label}
          className="absolute top-3 flex items-center gap-2 rounded-sm bg-background pr-2"
          style={{ left: column.left }}
        >
          <span className={`${HEADING} text-muted-foreground`}>{column.label}</span>
          <span className="font-mono text-[11px] text-faint">{column.meta}</span>
        </div>
      ))}
      {until && (
        <span
          className="absolute top-3 font-mono text-[11px] text-faint"
          style={{ right: BAND_PADDING }}
        >
          hasta {until}
        </span>
      )}
    </div>
  );
}
