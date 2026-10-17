import type { IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { DateRangeTimePicker } from "@/components/date-time-picker/DateRangeTimePicker";
import { dayShortcuts } from "@/components/date-time-picker/shortcuts";

/** El contenido de un popover para elegir un solo día, con sus atajos. */
export function DayPicker({
  date,
  onChange,
  onDone,
}: {
  date: IsoDate | undefined;
  onChange: (date: IsoDate | undefined) => void;
  onDone: () => void;
}) {
  const today = useRumbo().daily.today();

  return (
    <DateRangeTimePicker
      mode="day"
      shortcuts={dayShortcuts(today)}
      value={{ start: date }}
      onChange={({ start }) => onChange(start)}
      onDone={onDone}
    />
  );
}
