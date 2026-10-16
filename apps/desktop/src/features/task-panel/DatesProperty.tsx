import type { IsoDate } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { DateRangeTimePicker } from "@/components/date-time-picker/DateRangeTimePicker";
import { scheduleShortcuts } from "@/components/date-time-picker/shortcuts";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { formatLongDay } from "@/lib/format";

/** Cuándo empieza la tarea (y a qué hora) y, si tiene, cuándo vence: un solo selector. */
export function DatesProperty({
  scheduled,
  due,
  time,
  onChange,
}: {
  scheduled: IsoDate | undefined;
  due: IsoDate | undefined;
  time: string | undefined;
  onChange: (changes: { scheduled?: IsoDate; due?: IsoDate; time?: string }) => void;
}) {
  const today = useRumbo().daily.today();

  return (
    <PropertyRow
      label="Empieza · vence"
      value={
        (scheduled || due) && (
          <span className="flex items-center gap-2">
            {scheduled ? formatLongDay(scheduled) : "—"}
            {scheduled && time && <span className="font-mono">{time}</span>}
            {due && (
              <>
                <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                {formatLongDay(due)}
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
          withTime
          shortcuts={scheduleShortcuts(today)}
          value={{ start: scheduled, end: due, time }}
          onChange={(next) => onChange({ scheduled: next.start, due: next.end, time: next.time })}
          onDone={close}
        />
      )}
    </PropertyRow>
  );
}
