import type { TaskStep } from "@rumbo/core";
import { ListChecksIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetaItem } from "./MetaItem";
import { StepsBar } from "./StepsBar";

// El verde de «completo» se oscurece (en claro) o se aclara (en oscuro) hasta pasar AA en texto pequeño.
const COMPLETE = "text-[color-mix(in_oklab,var(--success),var(--foreground)_35%)]";

/** El progreso por pasos en pequeño, para las filas de una lista: ☑ 1/3 ▬▬▭. Sin pasos no sale. */
export function StepsChip({ steps, className }: { steps: TaskStep[]; className?: string }) {
  if (steps.length === 0) return null;
  const done = steps.filter((step) => step.done).length;

  return (
    <MetaItem
      label={`${done} de ${steps.length} pasos hechos`}
      className={cn("text-xs tabular-nums", done === steps.length && COMPLETE, className)}
    >
      <ListChecksIcon className="size-3.5 shrink-0" />
      <span>
        {done}/{steps.length}
      </span>
      <StepsBar done={done} total={steps.length} className="w-10" />
    </MetaItem>
  );
}
