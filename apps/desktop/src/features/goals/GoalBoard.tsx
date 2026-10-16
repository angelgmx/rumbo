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
import type { GoalStatus, GoalSummary } from "@rumbo/core";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { cn } from "@/lib/utils";
import { GoalCard } from "./GoalCard";
import { STATUS_LABEL, STATUS_ORDER, STATUS_STYLE } from "./goalLabels";

/** Un objetivo por tarjeta, en la columna de su estado; arrastrarla a otra columna lo cambia. */
export function GoalBoard({ goals }: { goals: GoalSummary[] }) {
  const rumbo = useRumbo();
  const [dragging, setDragging] = useState<GoalSummary>();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  function onDragStart({ active }: DragStartEvent) {
    setDragging(goals.find(({ id }) => id === active.id));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setDragging(undefined);
    const moved = goals.find(({ id }) => id === active.id);
    const status = over?.id as GoalStatus | undefined;
    if (moved && status && status !== moved.goal.status) {
      void rumbo.goals.setStatus(moved.id, status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(undefined)}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
        {STATUS_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            goals={goals.filter(({ goal }) => goal.status === status)}
          />
        ))}
      </div>
      <DragOverlay>{dragging && <GoalCard summary={dragging} className="shadow-lg" />}</DragOverlay>
    </DndContext>
  );
}

function Column({ status, goals }: { status: GoalStatus; goals: GoalSummary[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={STATUS_LABEL[status]}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-muted/30 p-3 transition-colors duration-(--dur-fast)",
        isOver && "bg-primary-soft/40",
      )}
    >
      <h2 className="flex items-center gap-2 px-1 text-sm">
        <span className={cn("size-2 rounded-full bg-current", STATUS_STYLE[status])} />
        <span className="font-medium">{STATUS_LABEL[status]}</span>
        <span className="font-mono text-xs text-muted-foreground">{goals.length}</span>
      </h2>
      <div className="flex min-h-16 flex-col gap-3 overflow-y-auto">
        {goals.map((summary) => (
          <DraggableCard key={summary.id} summary={summary} />
        ))}
      </div>
    </section>
  );
}

function DraggableCard({ summary }: { summary: GoalSummary }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: summary.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      <GoalCard summary={summary} />
    </div>
  );
}
