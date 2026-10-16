import { Progress } from "@/components/ui/progress";
import { percent } from "./goalLabels";

/** La barra de avance con su porcentaje; un objetivo sin plan está en 0 %. */
export function GoalProgressBar({ progress = 0 }: { progress?: number }) {
  return (
    <span className="flex items-center gap-3">
      <Progress
        value={progress * 100}
        aria-label="Progreso"
        className="min-w-0 flex-1 flex-nowrap"
      />
      <span className="w-11 text-right font-mono text-sm text-muted-foreground">
        {percent(progress)}
      </span>
    </span>
  );
}
