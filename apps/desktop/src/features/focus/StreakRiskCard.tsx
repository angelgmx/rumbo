import { minimumOf, type HabitSummary } from "@rumbo/core";
import { FlameIcon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StreakRiskCardProps {
  habits: HabitSummary[];
  onSave: (summary: HabitSummary, amount: number) => void;
}

/** Hábitos con racha que se perderían hoy, con el atajo para salvarla con lo mínimo. */
export function StreakRiskCard({ habits, onSave }: StreakRiskCardProps) {
  return (
    <Card className="gap-3 border-warning/40 bg-warning/5 p-5">
      <p className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-widest text-warning uppercase">
        <FlameIcon className="size-3.5" />
        Racha en riesgo
      </p>
      {habits.map((summary) => (
        <RiskLine key={summary.habit.key} summary={summary} onSave={onSave} />
      ))}
    </Card>
  );
}

function RiskLine({
  summary,
  onSave,
}: {
  summary: HabitSummary;
  onSave: StreakRiskCardProps["onSave"];
}) {
  const { habit, streak } = summary;
  const minimum = minimumOf(habit);
  const unit = habit.kind === "duration" ? "min" : habit.unit;
  const amount = minimum && `${minimum}${unit ? ` ${unit}` : ""}`;

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {habit.name} · {streak.count} días
        </p>
        <p className="text-sm text-muted-foreground">
          {amount
            ? `Hoy aún no. Con ${amount} la salvas.`
            : "Hoy aún no. Cúmplelo para no perderla."}
        </p>
      </div>
      {minimum !== undefined && (
        <Button variant="outline" onClick={() => onSave(summary, minimum)}>
          <PlayIcon data-icon="inline-start" />
          Hacer {amount}
        </Button>
      )}
    </div>
  );
}
