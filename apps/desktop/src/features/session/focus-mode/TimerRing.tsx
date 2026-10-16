import type { ReactNode } from "react";

const SIZE = 320;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const LENGTH = 2 * Math.PI * RADIUS;

/** El reloj del modo enfoque: un anillo que se vacía con el tiempo y lo que quede en medio. */
export function TimerRing({ remaining, children }: { remaining: number; children: ReactNode }) {
  const left = Math.min(1, Math.max(0, remaining));
  const angle = left * 2 * Math.PI - Math.PI / 2;
  const center = SIZE / 2;

  return (
    <div className="relative grid size-80 place-items-center rounded-full bg-card/60 shadow-card">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0" aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={LENGTH}
          strokeDashoffset={LENGTH * (1 - left)}
          transform={`rotate(-90 ${center} ${center})`}
          className="stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
        {left > 0 && (
          <circle
            cx={center + RADIUS * Math.cos(angle)}
            cy={center + RADIUS * Math.sin(angle)}
            r={STROKE}
            className="fill-primary"
          />
        )}
      </svg>
      <div className="relative flex flex-col items-center gap-2">{children}</div>
    </div>
  );
}
