import { minutesOf } from "@rumbo/core";
import { timeOf, useNow } from "@/hooks/useNow";
import { offsetOf, type MinuteRange } from "./geometry";

/** La línea de ahora en la columna de hoy. */
export function NowLine({ range }: { range: MinuteRange }) {
  const minutes = minutesOf(timeOf(useNow()));
  if (minutes < range.from || minutes > range.to) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-20 h-px bg-primary"
      style={{ top: offsetOf(minutes, range) }}
    >
      <span className="absolute -top-[3px] -left-[3px] size-[7px] rounded-full bg-primary" />
    </div>
  );
}

/** La hora de ahora en la columna de las horas, sobre la línea. */
export function NowLabel({ range }: { range: MinuteRange }) {
  const time = timeOf(useNow());
  const minutes = minutesOf(time);
  if (minutes < range.from || minutes > range.to) return null;

  return (
    <span
      className="absolute right-2 z-20 -translate-y-1/2 rounded-md bg-primary px-1.5 font-mono text-[12px] leading-5 font-medium text-primary-foreground"
      style={{ top: offsetOf(minutes, range) }}
    >
      {time}
    </span>
  );
}
