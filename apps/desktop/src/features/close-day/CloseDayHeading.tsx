import { addDays, type IsoDate } from "@rumbo/core";
import { ProgressRing } from "@/components/ProgressRing";
import { formatWeekday } from "@/lib/format";

/** El título del cierre con lo hecho hoy y su porcentaje en un anillo. */
export function CloseDayHeading({
  today,
  done,
  total,
}: {
  today: IsoDate;
  done: number;
  total: number;
}) {
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="font-mono text-[11px] font-medium tracking-widest text-primary-text uppercase">
          Ritual de cierre · 3 minutos
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Cierra el {formatWeekday(today)}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {done} de {total} hecho · mañana es {formatWeekday(addDays(today, 1))}
        </p>
      </div>
      <div className="relative grid place-items-center">
        <ProgressRing value={percent / 100} color="var(--success)" size={60} stroke={4} />
        <span className="absolute font-mono text-sm">{percent}%</span>
      </div>
    </div>
  );
}
