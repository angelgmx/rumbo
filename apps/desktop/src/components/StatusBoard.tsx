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

export interface BoardColumn<S extends string> {
  status: S;
  heading: ReactNode;
  /** Va al final de la columna, tras sus tarjetas, dentro de lo que se desplaza. */
  footer?: ReactNode;
  /** Una columna plegada enseña esto en vez de sus tarjetas y sigue aceptando las que se arrastran. */
  folded?: ReactNode;
}

/** Un tablero con una columna por estado: arrastrar una tarjeta a otra columna le cambia el estado. */
export function StatusBoard<S extends string, T extends { id: number }>({
  columns,
  items,
  statusOf,
  onMove,
  renderCard,
  columnClassName = "w-72 shrink-0",
}: {
  columns: BoardColumn<S>[];
  items: T[];
  statusOf: (item: T) => S;
  onMove: (item: T, status: S) => void;
  renderCard: (item: T, className?: string) => ReactNode;
  /** El ancho de las columnas abiertas. */
  columnClassName?: string;
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
        {columns.map(({ status, heading, footer, folded }) => (
          <Column
            key={status}
            status={status}
            heading={heading}
            footer={footer}
            folded={folded}
            className={columnClassName}
          >
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

/** El título de una columna: su icono, su nombre, cuántas tarjetas tiene y una acción al final. */
export function ColumnHeading({
  icon,
  title,
  count,
  action,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  action?: ReactNode;
}) {
  return (
    <h2 className="flex min-h-7 items-center gap-2 px-1 text-sm">
      {icon}
      <span className="font-medium">{title}</span>
      <span className="font-mono text-xs text-muted-foreground">{count}</span>
      {action && <span className="ml-auto flex items-center">{action}</span>}
    </h2>
  );
}

/** El punto de color de una columna, en el color de texto que se le dé. */
export function StatusDot({ className }: { className: string }) {
  return <span className={cn("size-2 rounded-full bg-current", className)} />;
}

function Column({
  status,
  heading,
  footer,
  folded,
  className,
  children,
}: {
  status: string;
  heading: ReactNode;
  footer: ReactNode;
  folded: ReactNode;
  className: string;
  children: ReactNode[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-muted/30 p-3 transition-colors duration-(--dur-fast)",
        folded ? "w-52 shrink-0" : className,
        isOver && "bg-primary-soft/40",
      )}
    >
      {heading}
      {folded ? (
        folded
      ) : (
        <>
          <div className="flex min-h-16 flex-col gap-3 overflow-y-auto">
            {children}
            {footer}
          </div>
        </>
      )}
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
