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
import type { BlockKind, RoutineBlock, TimedBlock } from "@rumbo/core";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { formatMinutes } from "@/lib/format";
import { AddBlock } from "./AddBlock";
import { BlockItem } from "./BlockItem";
import type { DraftBlock } from "./useRoutineDraft";

interface RoutineBlocksProps {
  blocks: DraftBlock[];
  timed: TimedBlock[];
  minutes: number;
  end: string;
  onChange: (index: number, changes: Partial<RoutineBlock>) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onAdd: (kind: BlockKind, ref?: string) => void;
}

/** Los bloques de la rutina en orden, con su hora; se arrastran para reordenar. */
export function RoutineBlocks({
  blocks,
  timed,
  minutes,
  end,
  onChange,
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
