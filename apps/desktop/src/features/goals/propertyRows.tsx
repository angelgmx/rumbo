import { periodChoices, periodHorizon, type GoalInput, type IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { DateRangeTimePicker } from "@/components/date-time-picker/DateRangeTimePicker";
import { dayShortcuts } from "@/components/date-time-picker/shortcuts";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { AreaDot } from "@/features/tasks/AreaDot";
import { useAreaNames } from "@/hooks/useAreaNames";
import { formatLongDay } from "@/lib/format";
import { periodLabel } from "./goalLabels";

type Change = (changes: Partial<GoalInput>) => void;

export function AreaRow({ area, onChange }: { area: string | undefined; onChange: Change }) {
  const areas = useAreaNames();

  return (
    <PropertyRow
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

/** Una fecha del objetivo (inicio o fecha límite), que se cambia en un calendario. */
export function DateRow({
  label,
  empty,
  date,
  onChange,
}: {
  label: string;
  empty: string;
  date: IsoDate | undefined;
  onChange: (date: IsoDate | undefined) => void;
}) {
  const today = useRumbo().daily.today();

  return (
    <PropertyRow label={label} empty={empty} value={date && formatLongDay(date)} width="w-auto p-1">
      {(close) => (
        <DateRangeTimePicker
          mode="day"
          shortcuts={dayShortcuts(today)}
          value={{ start: date }}
          onChange={({ start }) => onChange(start)}
          onDone={close}
        />
      )}
    </PropertyRow>
  );
}
