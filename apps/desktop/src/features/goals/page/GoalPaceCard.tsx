import type { GoalPaceState, GoalSummary } from "@rumbo/core";
import { cn } from "@/lib/utils";
import { daysLeftLabel, weeklyPaceLabel } from "../goalLabels";
import { AsideCard } from "./AsideCard";

const VERDICT: Record<GoalPaceState, { text: string; tone: string }> = {
  ahead: { text: "Vas por delante", tone: "text-success" },
  "on-track": { text: "Vas al día", tone: "text-success" },
  behind: { text: "Vas con retraso", tone: "text-warning" },
};

/**
 * «¿Llego?»: tu ritmo frente al que hace falta, con los días que quedan. Si core no puede
 * calcular el ritmo, solo los días hasta la fecha límite.
 */
export function GoalPaceCard({ summary: { goal, pace, daysLeft } }: { summary: GoalSummary }) {
  if (goal.status !== "active" || daysLeft === undefined) return null;

  return (
    <AsideCard title="¿Llego?">
      {pace?.state && (
        <span className={cn("text-xl font-semibold", VERDICT[pace.state].tone)}>
          {VERDICT[pace.state].text}
        </span>
      )}
      <dl className="flex flex-col gap-1.5 text-sm">
        <Figure label="Fecha límite" value={daysLeftLabel(daysLeft)} />
        {pace?.actualPerWeek !== undefined && (
          <Figure label="Tu ritmo" value={weeklyPaceLabel(pace.actualPerWeek)} />
        )}
        {pace?.requiredPerWeek !== undefined && (
          <Figure label="Necesario" value={weeklyPaceLabel(pace.requiredPerWeek)} />
        )}
      </dl>
      {pace && pace.actualPerWeek === undefined && (
        <p className="text-sm text-muted-foreground">
          Aún no hay una semana de avance para medir tu ritmo.
        </p>
      )}
    </AsideCard>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
