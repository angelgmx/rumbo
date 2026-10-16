import { addDays, type IsoDate } from "@rumbo/core";
import { formatWeekday } from "@/lib/format";

const SIZE = 60;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const LENGTH = 2 * Math.PI * RADIUS;

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
      <div className="relative grid size-15 place-items-center">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90" aria-hidden>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-muted"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={LENGTH}
            strokeDashoffset={LENGTH * (1 - percent / 100)}
            className="stroke-success"
          />
        </svg>
        <span className="font-mono text-sm">{percent}%</span>
      </div>
    </div>
  );
}
