import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { BlockKind, RoutineSummary } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BLOCK_KIND_ICON, BLOCK_KIND_LABEL } from "../look";
import { blockId, BlockRow, TimelineDot } from "./BlockRow";
import type { LibraryTab } from "./BlockLibrary";

export const BLOCK_LIST_ID = "blocks";

interface BlockListProps {
  summary: RoutineSummary;
  routineColor: string;
  currentIndex?: number;
  /** Hábitos, temas y tareas se eligen en la biblioteca: el botón lleva a su pestaña. */
  onPickFromLibrary: (tab: LibraryTab) => void;
}

/** La línea de la rutina: cada bloque con su hora y, al final, a qué hora acaba. */
export function BlockList({
  summary,
  routineColor,
  currentIndex,
  onPickFromLibrary,
}: BlockListProps) {
  const { setNodeRef, isOver } = useDroppable({ id: BLOCK_LIST_ID });

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2">
          <span className="font-medium">Bloques</span>
          <span className="text-sm text-muted-foreground">
            {summary.blocks.length} bloques · {formatMinutes(summary.minutes)}
          </span>
        </h2>
        <span className="text-sm text-faint">Arrastra para ordenar · clic para editar</span>
      </div>

      <SortableContext
        items={summary.blocks.map((block) => blockId(block.index))}
        strategy={verticalListSortingStrategy}
      >
        <ol
          ref={setNodeRef}
          className={cn(
            "flex min-h-16 flex-col gap-2 rounded-xl transition-colors duration-(--dur-fast)",
            isOver && "bg-primary-soft/40",
          )}
        >
          {summary.blocks.map((block) => (
            <BlockRow
              key={`${block.index}-${block.kind}-${block.ref ?? block.title ?? ""}`}
              summary={summary}
              block={block}
              routineColor={routineColor}
              current={block.index === currentIndex}
            />
          ))}
        </ol>
      </SortableContext>

      <div className="-mt-2 flex gap-3 text-sm">
        <span className="w-12 pt-3.5 text-center font-mono text-xs text-muted-foreground">
          {summary.end}
        </span>
        <div className="-mt-1">
          <TimelineDot last />
        </div>
        <span className="pt-3 text-muted-foreground">Fin de la rutina</span>
      </div>

      <AddBlockBar summary={summary} onPickFromLibrary={onPickFromLibrary} />
    </Card>
  );
}

const PICKED: Record<"habit" | "module" | "task", LibraryTab> = {
  habit: "habits",
  module: "modules",
  task: "tasks",
};

function AddBlockBar({
  summary,
  onPickFromLibrary,
}: {
  summary: RoutineSummary;
  onPickFromLibrary: (tab: LibraryTab) => void;
}) {
  const rumbo = useRumbo();

  function add(kind: BlockKind) {
    if (kind === "break") return rumbo.routines.addBlock(summary.id, { kind, minutes: 10 });
    if (kind === "custom") {
      return rumbo.routines.addBlock(summary.id, { kind, title: "Bloque libre", minutes: 15 });
    }
    onPickFromLibrary(PICKED[kind]);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed p-2 pl-4">
      <PlusIcon className="size-4 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">Añadir bloque</span>
      {(["habit", "module", "task", "break", "custom"] as const).map((kind) => {
        const Icon = BLOCK_KIND_ICON[kind];
        return (
          <Button key={kind} variant="outline" size="sm" onClick={() => add(kind)}>
            <Icon data-icon="inline-start" />
            {BLOCK_KIND_LABEL[kind]}
          </Button>
        );
      })}
    </div>
  );
}
