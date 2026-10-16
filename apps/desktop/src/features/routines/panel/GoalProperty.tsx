import { TargetIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";

/** El objetivo al que empuja la rutina. */
export function GoalProperty({
  goalId,
  onChange,
}: {
  goalId: number | undefined;
  onChange: (goalId: number | undefined) => void;
}) {
  const goals = useRumbo().goals.list();
  const current = goals.find((summary) => summary.id === goalId);

  return (
    <PropertyRow
      label="Objetivo"
      empty="Sin objetivo"
      value={
        current && (
          <>
            <TargetIcon className="size-4 text-muted-foreground" />
            <span className="truncate">{current.goal.title}</span>
          </>
        )
      }
      width="w-72"
    >
      {(close) => (
        <OptionList
          options={goals.map(({ id, goal }) => ({ value: String(id), label: goal.title }))}
          value={goalId === undefined ? undefined : String(goalId)}
          clearLabel="Sin objetivo"
          onChoose={(id) => {
            onChange(id === undefined ? undefined : Number(id));
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}
