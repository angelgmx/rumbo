import type { GoalSummary } from "@rumbo/core";
import { Progress } from "@/components/ui/progress";
import { percent } from "../goalLabels";
import { AsideCard } from "./AsideCard";

/** El avance en grande y de dónde sale: sus resultados clave o lo que lo empuja. */
export function GoalProgressCard({ summary: { goal, progress } }: { summary: GoalSummary }) {
  return (
    <AsideCard title="Progreso">
      {progress === undefined ? (
        <p className="text-muted-foreground">
          Sin plan: añade resultados clave o conecta lo que lo empuja.
        </p>
      ) : (
        <>
          <span className="text-4xl font-semibold tracking-tight">{percent(progress)}</span>
          <Progress value={progress * 100} aria-label="Progreso del objetivo" />
          <p className="text-sm text-muted-foreground">
            {goal.keyResults.length > 0 ? "Según sus resultados clave." : "Según lo que lo empuja."}
          </p>
        </>
      )}
    </AsideCard>
  );
}
