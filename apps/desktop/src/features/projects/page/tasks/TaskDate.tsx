import type { Task } from "@rumbo/core";
import type { CSSProperties } from "react";
import { useRumbo } from "@/app/RumboContext";
import { useArea } from "@/hooks/useArea";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Cuándo toca la tarea: «21 oct · 17:00» u «Hoy». Con hora se tiñe del color de su área; si ya
 * pasó sin hacerse, de rojo.
 */
export function TaskDate({ task }: { task: Task }) {
  const today = useRumbo().daily.today();
  const { color } = useArea(task.area);
  const date = task.scheduled ?? task.due;
  if (!date) return null;

  const late = !task.done && date < today;
  const label = [date === today ? "Hoy" : formatDayMonth(date), task.time]
    .filter(Boolean)
    .join(" · ");

  return (
    <span
      style={{ "--area": color } as CSSProperties}
      className={cn(
        "inline-flex h-6 w-fit items-center rounded-md bg-muted px-2 font-mono text-xs whitespace-nowrap",
        task.time && "bg-[color-mix(in_oklab,var(--area)_16%,transparent)] text-(--area)",
        late && "bg-destructive/10 text-destructive",
      )}
    >
      {label}
    </span>
  );
}
