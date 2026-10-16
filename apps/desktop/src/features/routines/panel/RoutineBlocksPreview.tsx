import type { RoutineBlock } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { BlockStrip } from "../BlockStrip";
import { BLOCK_KIND_LABEL } from "../look";

/** Los bloques que traerá la rutina, para verlos antes de crearla. */
export function RoutineBlocksPreview({ blocks, color }: { blocks: RoutineBlock[]; color: string }) {
  const { routines } = useRumbo();
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <SectionLabel>Bloques</SectionLabel>
        <span className="text-xs text-muted-foreground">los ordenas después en el editor</span>
      </div>
      <BlockStrip blocks={blocks} routineColor={color} />
      <ol className="flex flex-col">
        {blocks.map((block, index) => (
          <li key={index} className="flex items-center gap-3 border-b py-2 text-sm last:border-0">
            <span className="w-4 font-mono text-xs text-faint">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate">{routines.blockName(block)}</span>
            <span className="text-xs text-muted-foreground">{BLOCK_KIND_LABEL[block.kind]}</span>
            <span className="w-14 text-right font-mono text-xs text-muted-foreground">
              {block.minutes} min
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
