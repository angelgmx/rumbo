import type { IsoDate } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { formatLongDay } from "@/lib/format";
import { PropertyRow } from "./PropertyRow";

/** Cuándo empieza la tarea y, si tiene, cuándo vence: un solo calendario para las dos. */
export function DatesProperty({
  scheduled,
  due,
  onChange,
}: {
  scheduled: IsoDate | undefined;
  due: IsoDate | undefined;
  onChange: (changes: { scheduled?: IsoDate; due?: IsoDate }) => void;
}) {
  return (
    <PropertyRow
      label="Empieza · vence"
      value={
        (scheduled || due) && (
          <span className="flex items-center gap-2">
            {scheduled ? formatLongDay(scheduled) : "—"}
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
        <DateRangePicker
          value={{ start: scheduled, end: due }}
          onChange={({ start, end }) => onChange({ scheduled: start, due: end })}
          onDone={close}
        />
      )}
    </PropertyRow>
  );
}
