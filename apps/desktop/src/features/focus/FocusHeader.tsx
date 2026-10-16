import type { IsoDate } from "@rumbo/core";
import { capitalize, formatDay } from "@/lib/format";

interface FocusHeaderProps {
  today: IsoDate;
  greeting: string;
  done: number;
  total: number;
  /** Si hay algo en curso, que ocupa un tramo propio en la barra. */
  hasNow: boolean;
}

/** La fecha, el saludo y cuánto del día llevas hecho. */
export function FocusHeader({ today, greeting, done, total, hasNow }: FocusHeaderProps) {
  const left = total - done;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{capitalize(formatDay(today))}</h1>
        <p className="mt-1 text-muted-foreground">
          {greeting}{" "}
          {left === 0
            ? "Hoy no queda nada."
            : `Te quedan ${left} ${left === 1 ? "cosa" : "cosas"}.`}
        </p>
      </div>
      <div className="flex w-72 flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>
            {done} de {total} hecho
          </span>
          <span className="font-mono text-muted-foreground">{percent} %</span>
        </div>
        <div
          className="flex h-1.5 gap-1"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <Segment grow={done} className="bg-success" />
          <Segment grow={hasNow && left > 0 ? 1 : 0} className="bg-primary" />
          <Segment grow={hasNow && left > 0 ? left - 1 : left} className="bg-muted" />
        </div>
      </div>
    </div>
  );
}

function Segment({ grow, className }: { grow: number; className: string }) {
  if (grow <= 0) return null;
  return <span className={`rounded-full ${className}`} style={{ flexGrow: grow, flexBasis: 0 }} />;
}
