import { minutesBetween } from "@rumbo/core";
import { formatMinutes } from "@/lib/format";
import { tint } from "./tint";

/** La pastilla de hora de un evento: «17:00 · 2 h». Sin duración, solo la hora. */
export function TimePill({ start, end, color }: { start: string; end?: string; color: string }) {
  return (
    <span
      className="w-fit rounded-full border px-2 font-mono text-[12px] leading-5 whitespace-nowrap"
      style={{ backgroundColor: tint(color, 16), borderColor: tint(color, 40) }}
    >
      {start}
      {end && ` · ${formatMinutes(minutesBetween(start, end))}`}
    </span>
  );
}
