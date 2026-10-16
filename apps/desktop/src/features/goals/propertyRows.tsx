import { periodChoices, periodHorizon, type GoalInput } from "@rumbo/core";
import type { LucideIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { AreaDot } from "@/features/tasks/AreaDot";
import { useAreaNames } from "@/hooks/useAreaNames";
import { periodLabel } from "./goalLabels";

type Change = (changes: Partial<GoalInput>) => void;

export function AreaRow({
  icon,
  area,
  onChange,
}: {
  icon?: LucideIcon;
  area: string | undefined;
  onChange: Change;
}) {
  const areas = useAreaNames();

  return (
    <PropertyRow
      icon={icon}
      label="Área"
      empty="Sin área"
      value={
        area && (
          <>
            <AreaDot area={area} />
            {area}
          </>
        )
      }
      width="w-60"
    >
      {(close) => (
        <OptionList
          options={areas.map((name) => ({ value: name, label: name }))}
          value={area}
          clearLabel="Sin área"
          onChoose={(next) => {
            onChange({ area: next });
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}

export function PeriodRow({ period, onChange }: { period: string | undefined; onChange: Change }) {
  const today = useRumbo().daily.today();

  return (
    <PropertyRow
      label="Periodo"
      empty="Sin periodo"
      value={period && periodLabel(period)}
      width="w-56"
    >
      {(close) => (
        <OptionList
          options={periodChoices(today).map((choice) => ({
            value: choice,
            label: periodLabel(choice),
          }))}
          value={period}
          clearLabel="Sin periodo"
          onChoose={(next) => {
            onChange({ period: next, horizon: next ? periodHorizon(next) : undefined });
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}
