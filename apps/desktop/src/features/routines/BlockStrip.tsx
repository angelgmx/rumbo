import type { RoutineBlock } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { cn } from "@/lib/utils";
import { BREAK_PATTERN, useBlockColor } from "./look";

interface BlockStripProps {
  blocks: RoutineBlock[];
  routineColor: string;
  /** Con etiquetas («Café · 10») en la tarjeta; sin ellas, una barra fina. */
  labeled?: boolean;
  className?: string;
}

/** Los bloques de una rutina en fila, cada uno tan ancho como sus minutos. */
export function BlockStrip({ blocks, routineColor, labeled = false, className }: BlockStripProps) {
  return (
    <div className={cn("flex gap-1", labeled ? "h-8" : "h-1.5", className)}>
      {blocks.map((block, index) => (
        <Segment key={index} block={block} routineColor={routineColor} labeled={labeled} />
      ))}
    </div>
  );
}

function Segment({
  block,
  routineColor,
  labeled,
}: {
  block: RoutineBlock;
  routineColor: string;
  labeled: boolean;
}) {
  const color = useBlockColor(block.kind, block.ref, routineColor);
  const isBreak = block.kind === "break";
  const { routines } = useRumbo();
  const title = routines.blockName(block);

  return (
    <div
      title={`${title} · ${block.minutes} min`}
      className={cn(
        "flex min-w-0 items-center rounded-md border",
        labeled ? "px-2 text-xs" : "rounded-full border-0",
      )}
      style={{
        flexGrow: block.minutes,
        flexBasis: 0,
        color: labeled ? "var(--foreground)" : undefined,
        borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
        background: isBreak
          ? BREAK_PATTERN
          : `color-mix(in oklab, ${color} ${labeled ? 16 : 55}%, transparent)`,
      }}
    >
      {labeled && (
        <span className="truncate">
          {isBreak ? "" : `${title} · `}
          <span className="text-muted-foreground">{block.minutes}</span>
        </span>
      )}
    </div>
  );
}
