import type { TaskStep } from "@rumbo/core";
import { ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Los pasos hechos de una tarea, «2/4»; completos, en verde. Sin pasos no sale. */
export function StepsCount({ steps }: { steps: TaskStep[] }) {
  if (steps.length === 0) return null;
  const done = steps.filter((step) => step.done).length;

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 font-mono text-xs text-muted-foreground",
        done === steps.length && "text-success",
      )}
    >
      <ListIcon className="size-3.5" />
      {done}/{steps.length}
    </span>
  );
}
