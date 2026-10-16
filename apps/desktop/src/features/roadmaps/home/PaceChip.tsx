import type { RoadmapSummary } from "@rumbo/core";
import { cn } from "@/lib/utils";
import { paceChip } from "../paceLabels";

/** El estado de ritmo de una ruta: texto apagado y un punto con el color del estado. */
export function PaceChip({ roadmap, className }: { roadmap: RoadmapSummary; className?: string }) {
  const { text, dot } = paceChip(roadmap);
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-md border bg-muted/40 px-2 text-xs whitespace-nowrap text-muted-foreground",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {text}
    </span>
  );
}
