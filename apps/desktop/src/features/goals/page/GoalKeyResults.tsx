import type { GoalSummary } from "@rumbo/core";
import { useState } from "react";
import { AddAction, GoalSection } from "./GoalSection";
import { KeyResultRow } from "./KeyResultRow";
import { NewKeyResult } from "./NewKeyResult";

/** Los resultados clave del objetivo: se añaden, se renombran, se miden y se quitan aquí mismo. */
export function GoalKeyResults({ summary }: { summary: GoalSummary }) {
  const { id, goal } = summary;
  const [adding, setAdding] = useState(false);

  return (
    <GoalSection
      title="Resultados clave"
      action={!adding && <AddAction onClick={() => setAdding(true)} />}
    >
      {goal.keyResults.length > 0 && (
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {goal.keyResults.map((keyResult, index) => (
            <KeyResultRow key={index} goalId={id} index={index} keyResult={keyResult} />
          ))}
        </ul>
      )}
      {adding && <NewKeyResult goalId={id} onDone={() => setAdding(false)} />}
    </GoalSection>
  );
}
