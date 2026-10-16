import type { IsoDate } from "@rumbo/core";
import { DateRangePicker } from "@/components/DateRangePicker";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { formatLongDay } from "@/lib/format";

/** Una fecha suelta (inicio, fecha límite…), que se cambia en un calendario. */
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
  return (
    <PropertyRow label={label} empty={empty} value={date && formatLongDay(date)} width="w-auto p-1">
      {(close) => (
        <DateRangePicker
          single
          value={{ start: date }}
          onChange={({ start }) => onChange(start)}
          onDone={close}
        />
      )}
    </PropertyRow>
  );
}
