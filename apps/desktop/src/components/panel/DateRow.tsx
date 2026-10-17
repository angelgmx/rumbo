import type { IsoDate } from "@rumbo/core";
import type { LucideIcon } from "lucide-react";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { formatLongDay } from "@/lib/format";
import { DayPicker } from "./DayPicker";

/** Una fecha suelta (inicio, fecha límite…), que se cambia en un calendario. */
export function DateRow({
  icon,
  label,
  empty,
  date,
  hint,
  onChange,
}: {
  icon?: LucideIcon;
  label: string;
  empty: string;
  date: IsoDate | undefined;
  /** Algo apagado tras la fecha, como los días que quedan. */
  hint?: string;
  onChange: (date: IsoDate | undefined) => void;
}) {
  return (
    <PropertyRow
      icon={icon}
      label={label}
      empty={empty}
      value={
        date && (
          <>
            {formatLongDay(date)}
            {hint && <span className="font-normal text-muted-foreground">· {hint}</span>}
          </>
        )
      }
      width="w-auto p-1"
    >
      {(close) => <DayPicker date={date} onChange={onChange} onDone={close} />}
    </PropertyRow>
  );
}
