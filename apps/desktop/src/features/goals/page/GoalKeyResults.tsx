import { keyResultProgress, type GoalSummary, type KeyResult } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { percent } from "../goalLabels";

/** La métrica de cada resultado clave, de dónde parte a dónde llega, y dónde vas (se apunta aquí). */
export function GoalKeyResults({ summary }: { summary: GoalSummary }) {
  const { id, goal } = summary;

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>Resultados clave</SectionLabel>
      {goal.keyResults.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin métrica: el avance sale de lo que lo empuja.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {goal.keyResults.map((keyResult, index) => (
            <KeyResultRow key={index} goalId={id} index={index} keyResult={keyResult} />
          ))}
        </ul>
      )}
    </section>
  );
}

function KeyResultRow({
  goalId,
  index,
  keyResult,
}: {
  goalId: number;
  index: number;
  keyResult: KeyResult;
}) {
  const { goals } = useRumbo();
  const progress = keyResultProgress(keyResult);
  const current = keyResult.current ?? keyResult.from;

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex-1 truncate font-medium">{keyResult.title}</span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          {keyResult.from}
          <ArrowRightIcon className="size-3" />
          {keyResult.target} {keyResult.unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={progress * 100} className="flex-1" aria-label={keyResult.title} />
        <Input
          key={current}
          type="number"
          defaultValue={current}
          aria-label={`Dónde vas en ${keyResult.title}`}
          onBlur={(event) => {
            const value = Number(event.target.value);
            if (event.target.value !== "" && value !== current) {
              void goals.setCurrent(goalId, index, value);
            }
          }}
          className="h-7 w-20 font-mono"
        />
        <span className="w-12 text-right font-mono text-sm">{percent(progress)}</span>
      </div>
    </li>
  );
}
