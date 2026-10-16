import type { IsoDate } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { DateRangeTimePicker } from "@/components/date-time-picker/DateRangeTimePicker";
import { spanShortcuts } from "@/components/date-time-picker/shortcuts";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { formatLongDay } from "@/lib/format";

/** Del día que empieza a la fecha límite, en un solo calendario. */
export function GoalDatesRow({
  start,
  deadline,
  onChange,
}: {
  start: IsoDate | undefined;
  deadline: IsoDate | undefined;
  onChange: (changes: { start?: IsoDate; deadline?: IsoDate }) => void;
}) {
  const today = useRumbo().daily.today();

  return (
    <PropertyRow
      label="Fechas"
      empty="Sin fechas"
      value={
        (start || deadline) && (
          <span className="flex items-center gap-2">
            {start ? formatLongDay(start) : "—"}
            {deadline && (
              <>
                <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                {formatLongDay(deadline)}
              </>
            )}
          </span>
        )
      }
      width="w-auto p-1"
    >
      {(close) => (
        <DateRangeTimePicker
          mode="range"
          shortcuts={spanShortcuts(today)}
          value={{ start, end: deadline }}
          onChange={(range) => onChange({ start: range.start, deadline: range.end })}
          onDone={close}
        />
      )}
    </PropertyRow>
  );
}
