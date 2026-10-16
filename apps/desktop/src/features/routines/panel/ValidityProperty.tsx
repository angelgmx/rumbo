import type { IsoDate } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { formatLongDay } from "@/lib/format";

/** Entre qué días toca la rutina; sin fechas, siempre. Pasada la última, deja de tocar. */
export function ValidityProperty({
  from,
  until,
  onChange,
}: {
  from: IsoDate | undefined;
  until: IsoDate | undefined;
  onChange: (changes: { from?: IsoDate; until?: IsoDate }) => void;
}) {
  return (
    <PropertyRow
      label="Vigencia"
      value={
        from || until ? (
          <span className="flex items-center gap-2">
            {from ? formatLongDay(from) : "—"}
            {until && (
              <>
                <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                {formatLongDay(until)}
              </>
            )}
          </span>
        ) : (
          "Siempre"
        )
      }
      width="w-auto p-1"
    >
      {(close) => (
        <DateRangePicker
          value={{ start: from, end: until }}
          onChange={({ start, end }) => onChange({ from: start, until: end })}
          onDone={close}
        />
      )}
    </PropertyRow>
  );
}
