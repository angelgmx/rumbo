import type { IsoDate } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { formatLongDay } from "@/lib/format";
import { DatePicker } from "./DatePicker";
import { PropertyRow } from "./PropertyRow";

/** Cuándo empieza la tarea y cuándo vence, en una sola fila con las dos fechas. */
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
            <ArrowRightIcon className="size-3.5 text-muted-foreground" />
            {due ? formatLongDay(due) : "—"}
          </span>
        )
      }
      width="w-64 gap-0 p-1"
    >
      {(close) => (
        <>
          <p className="px-2.5 pt-2 text-xs text-muted-foreground">Empieza</p>
          <DatePicker
            label="Empieza"
            value={scheduled}
            onChange={(date) => onChange({ scheduled: date })}
            onDone={close}
          />
          <p className="px-2.5 text-xs text-muted-foreground">Vence</p>
          <DatePicker
            label="Vence"
            value={due}
            onChange={(date) => onChange({ due: date })}
            onDone={close}
          />
        </>
      )}
    </PropertyRow>
  );
}
