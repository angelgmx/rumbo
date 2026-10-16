import type { TaskStep } from "@rumbo/core";
import { cn } from "@/lib/utils";
import { StepsBar } from "./StepsBar";

/** El progreso por pasos en pequeño, para las filas de una lista: ▬▬▭ 1 / 3. Sin pasos no sale. */
export function StepsChip({ steps, className }: { steps: TaskStep[]; className?: string }) {
  if (steps.length === 0) return null;
  const done = steps.filter((step) => step.done).length;

  return (
    <span className={cn("flex items-center gap-2 font-mono text-xs", className)}>
      <StepsBar done={done} total={steps.length} className="w-14" />
      <span className={done === steps.length ? "text-success" : "text-primary-text"}>
        {done} / {steps.length}
      </span>
    </span>
  );
}
