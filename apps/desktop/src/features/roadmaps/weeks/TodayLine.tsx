import { formatDayMonth } from "@/lib/format";
import type { IsoDate } from "@rumbo/core";

/** La línea de «hoy» sobre la semana en curso. */
export function TodayLine({ today }: { today: IsoDate }) {
  return (
    <div className="flex items-center gap-3 py-1" role="separator" aria-label="Hoy">
      <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-[11px] text-primary-foreground">
        Hoy · {formatDayMonth(today)}
      </span>
      <span className="h-px flex-1 bg-primary/60" />
    </div>
  );
}
