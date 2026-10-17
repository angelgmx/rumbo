import { freeMinutes, minutesOf, type Interval } from "@rumbo/core";
import { formatMinutes } from "@/lib/format";
import { offsetOf, type MinuteRange } from "./geometry";

/** Un hueco libre largo: rayado muy suave con lo que dura. No estorba al arrastrar. */
export function GapBlock({ gap, range }: { gap: Interval; range: MinuteRange }) {
  const top = offsetOf(minutesOf(gap.start), range);
  const height = offsetOf(minutesOf(gap.end), range) - top;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 flex items-center justify-center text-[13px] text-faint"
      style={{
        top,
        height,
        backgroundImage:
          "repeating-linear-gradient(135deg, color-mix(in oklab, var(--muted-foreground) 10%, transparent) 0 1px, transparent 1px 7px)",
      }}
    >
      {formatMinutes(freeMinutes([gap]))} libres
    </div>
  );
}
