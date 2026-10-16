import { TargetIcon } from "lucide-react";
import { ReadOnlyRow } from "@/components/panel/PropertyRow";

/** El objetivo al que empuja la tarea: no se elige aquí, viene del hábito o de la ruta. */
export function GoalProperty({ goal }: { goal: string }) {
  return (
    <ReadOnlyRow label="Objetivo">
      <TargetIcon className="size-4 text-muted-foreground" />
      <span className="truncate">{goal}</span>
      <span className="text-xs text-muted-foreground">heredado</span>
    </ReadOnlyRow>
  );
}
