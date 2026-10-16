import type { GoalSummary } from "@rumbo/core";
import { ChartNoAxesColumnIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoalProgressBar } from "../GoalProgressBar";
import { paceReading } from "../goalPace";

/** El avance en una línea y, debajo, cómo va el ritmo: «Vas 45 % por detrás · terminas en sep 2027». */
export function GoalProgressLine({ summary }: { summary: GoalSummary }) {
  const reading = paceReading(summary);

  return (
    <section
      aria-label="Progreso"
      className="grid grid-cols-[9rem_1fr] items-center gap-x-2 gap-y-3 border-t pt-6"
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <ChartNoAxesColumnIcon className="size-4" />
        Progreso
      </span>
      <GoalProgressBar progress={summary.progress} />
      {reading && (
        <span className="col-start-2 flex items-center gap-2 text-sm">
          <span className={cn("size-2 shrink-0 rounded-full bg-current", reading.style)} />
          <span>
            <span className="font-medium">{reading.text}</span>
            {reading.detail && <span className="text-muted-foreground"> · {reading.detail}</span>}
          </span>
        </span>
      )}
    </section>
  );
}
