import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BLOCK_KINDS, type BlockKind, type RoutineBlock, type TimedBlock } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMinutes } from "@/lib/format";
import { BLOCK_KIND_ICON, BLOCK_KIND_LABEL } from "../look";
import { BlockItem } from "./BlockItem";
import type { DraftBlock } from "./useRoutineDraft";

interface RoutineBlocksProps {
  blocks: DraftBlock[];
  timed: TimedBlock[];
  minutes: number;
  end: string;
  onChange: (index: number, changes: Partial<RoutineBlock>) => void;
  onRetype: (index: number, kind: BlockKind) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onAdd: (kind: BlockKind) => void;
}

/** Los bloques de la rutina en orden, con su hora; se arrastran para reordenar. */
export function RoutineBlocks({
  blocks,
  timed,
  minutes,
  end,
  onChange,
  onRetype,
  onRemove,
  onMove,
  onAdd,
}: RoutineBlocksProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = blocks.map(({ id }) => id);
    onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <SectionLabel>Bloques</SectionLabel>
        {blocks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatMinutes(minutes)} · termina {end}
          </span>
        )}
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
          <ol className="flex flex-col gap-1.5">
            {blocks.map(({ id, block }, index) => (
              <BlockItem
                key={id}
                id={id}
                block={block}
                start={timed[index]!.start}
                onChange={(changes) => onChange(index, changes)}
                onRetype={(kind) => onRetype(index, kind)}
                onRemove={() => onRemove(index)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <AddBlock onAdd={onAdd} />
    </section>
  );
}

function AddBlock({ onAdd }: { onAdd: (kind: BlockKind) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="justify-start text-muted-foreground" />}
      >
        <PlusIcon data-icon="inline-start" />
        Añadir bloque
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {BLOCK_KINDS.map((kind) => {
          const Icon = BLOCK_KIND_ICON[kind];
          return (
            <DropdownMenuItem key={kind} onClick={() => onAdd(kind)}>
              <Icon />
              {BLOCK_KIND_LABEL[kind]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
