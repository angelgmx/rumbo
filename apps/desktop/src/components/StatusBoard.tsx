import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Un tablero con una columna por estado: arrastrar una tarjeta a otra columna le cambia el estado. */
export function StatusBoard<S extends string, T extends { id: number }>({
  items,
  statusOf,
  statuses,
  label,
  dotStyle,
  onMove,
  renderCard,
}: {
  items: T[];
  statusOf: (item: T) => S;
  statuses: readonly S[];
  label: Record<S, string>;
  /** Color del punto de cada columna, como clase de texto. */
  dotStyle: Record<S, string>;
  onMove: (item: T, status: S) => void;
  renderCard: (item: T, className?: string) => ReactNode;
}) {
  const [dragging, setDragging] = useState<T>();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  function onDragStart({ active }: DragStartEvent) {
    setDragging(items.find(({ id }) => id === active.id));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setDragging(undefined);
    const moved = items.find(({ id }) => id === active.id);
    const status = over?.id as S | undefined;
    if (moved && status && status !== statusOf(moved)) onMove(moved, status);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(undefined)}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <Column key={status} status={status} title={label[status]} dotStyle={dotStyle[status]}>
            {items
              .filter((item) => statusOf(item) === status)
              .map((item) => (
                <DraggableCard key={item.id} id={item.id}>
                  {renderCard(item)}
                </DraggableCard>
              ))}
          </Column>
        ))}
      </div>
      <DragOverlay>{dragging && renderCard(dragging, "shadow-lg")}</DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  title,
  dotStyle,
  children,
}: {
  status: string;
  title: string;
  dotStyle: string;
  children: ReactNode[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-muted/30 p-3 transition-colors duration-(--dur-fast)",
        isOver && "bg-primary-soft/40",
      )}
    >
      <h2 className="flex items-center gap-2 px-1 text-sm">
        <span className={cn("size-2 rounded-full bg-current", dotStyle)} />
        <span className="font-medium">{title}</span>
        <span className="font-mono text-xs text-muted-foreground">{children.length}</span>
      </h2>
      <div className="flex min-h-16 flex-col gap-3 overflow-y-auto">{children}</div>
    </section>
  );
}

function DraggableCard({ id, children }: { id: number; children: ReactNode }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      {children}
    </div>
  );
}
