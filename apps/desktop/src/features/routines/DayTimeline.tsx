import { minutesBetween, type RoutineSummary } from "@rumbo/core";
import { Link } from "wouter";
import { AreaIcon } from "@/components/AreaIcon";
import { timeOf, useNow } from "@/hooks/useNow";
import { formatMinutes, formatShortWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BlockStrip } from "./BlockStrip";
import { useRoutineLook } from "./look";
import { routineHref } from "./links";

// La franja empieza a las 07:00 salvo que alguna rutina empiece antes, y acaba a medianoche.
const DEFAULT_FIRST_HOUR = 7;
const LAST_HOUR = 24;
// Un hueco más corto no merece etiqueta: no da para hacer nada.
const MIN_FREE_MINUTES = 45;

interface DayTimelineProps {
  today: RoutineSummary[];
  /** Rutinas activas que hoy no tocan: salen punteadas, en su hora. */
  other: RoutineSummary[];
}

/** El día de hoy en horas: cada rutina en su sitio, los huecos libres y la línea de ahora. */
export function DayTimeline({ today, other }: DayTimelineProps) {
  const now = timeOf(useNow());
  const firstHour = Math.min(
    DEFAULT_FIRST_HOUR,
    ...today.map((summary) => Number(summary.routine.start.slice(0, 2))),
  );
  const span = (LAST_HOUR - firstHour) * 60;
  const position = (time: string) =>
    Math.min(Math.max(minutesBetween(`${pad(firstHour)}:00`, time) / span, 0), 1) * 100;
  const hours = Array.from(
    { length: Math.floor((LAST_HOUR - firstHour) / 2) + 1 },
    (_, i) => firstHour + i * 2,
  ).filter((hour) => hour < LAST_HOUR);

  return (
    <div className="relative">
      <div className="relative h-6 font-mono text-xs text-faint">
        {hours.map((hour) => (
          <span
            key={hour}
            className="absolute -translate-x-1/2"
            style={{ left: `${position(`${pad(hour)}:00`)}%` }}
          >
            {pad(hour)}
          </span>
        ))}
        <NowChip time={now} left={position(now)} />
      </div>

      <div className="relative h-7">
        {today.map((summary) => (
          <RoutineLabel key={summary.id} summary={summary} left={position(summary.routine.start)} />
        ))}
      </div>

      <div className="relative h-16 rounded-xl border bg-muted/40">
        {hours.slice(1).map((hour) => (
          <span
            key={hour}
            aria-hidden
            className="absolute inset-y-0 w-px bg-border/60"
            style={{ left: `${position(`${pad(hour)}:00`)}%` }}
          />
        ))}
        {today.map((summary) => (
          <RoutineBar
            key={summary.id}
            summary={summary}
            left={position(summary.routine.start)}
            width={position(summary.end) - position(summary.routine.start)}
          />
        ))}
        {freeGaps(today).map((gap) => (
          <FreeGap
            key={gap.from}
            minutes={gap.minutes}
            left={position(gap.from)}
            right={position(gap.to)}
          />
        ))}
      </div>

      {other.length > 0 && (
        <div className="relative mt-2 h-7">
          {other.map((summary) => (
            <GhostRoutine
              key={summary.id}
              summary={summary}
              left={position(summary.routine.start)}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute top-6 w-px bg-primary",
          other.length > 0 ? "bottom-9" : "bottom-0",
        )}
        style={{ left: `${position(now)}%` }}
      >
        <span className="absolute -bottom-1 -left-1 size-2 rounded-full bg-primary" />
      </div>
    </div>
  );
}

function NowChip({ time, left }: { time: string; left: number }) {
  return (
    <span
      className="absolute -top-0.5 z-10 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground shadow-card"
      style={{ left: `${left}%` }}
    >
      {time}
    </span>
  );
}

function RoutineLabel({ summary, left }: { summary: RoutineSummary; left: number }) {
  const look = useRoutineLook(summary.routine);
  return (
    <span
      className="absolute flex items-center gap-1.5 text-sm whitespace-nowrap"
      style={{ left: `${left}%` }}
    >
      <AreaIcon area={look} className="size-5 rounded-md [&_svg]:size-3" />
      <span className="font-medium">{summary.title}</span>
      <span className="font-mono text-xs text-muted-foreground">{summary.routine.start}</span>
    </span>
  );
}

function RoutineBar({
  summary,
  left,
  width,
}: {
  summary: RoutineSummary;
  left: number;
  width: number;
}) {
  const look = useRoutineLook(summary.routine);
  return (
    <Link
      href={routineHref(summary.id)}
      aria-label={`${summary.title}, de ${summary.routine.start} a ${summary.end}`}
      className="absolute top-2 bottom-2 rounded-lg border p-1.5 transition-transform duration-(--dur-fast) hover:-translate-y-px"
      style={{
        left: `${left}%`,
        width: `max(${width}%, 1.75rem)`,
        borderColor: `color-mix(in oklab, ${look.color} 60%, transparent)`,
        background: `color-mix(in oklab, ${look.color} 14%, transparent)`,
      }}
    >
      <BlockStrip blocks={summary.routine.blocks} routineColor={look.color} className="h-full" />
    </Link>
  );
}

function FreeGap({ minutes, left, right }: { minutes: number; left: number; right: number }) {
  return (
    <div
      className="absolute top-1/2 flex -translate-y-1/2 items-center gap-2 px-2 text-xs whitespace-nowrap text-faint"
      style={{ left: `${left}%`, width: `${right - left}%` }}
    >
      <span className="h-px flex-1 border-t border-dashed" />
      {formatMinutes(minutes)} libres
      <span className="h-px flex-1 border-t border-dashed" />
    </div>
  );
}

function GhostRoutine({ summary, left }: { summary: RoutineSummary; left: number }) {
  const look = useRoutineLook(summary.routine);
  return (
    <Link
      href={routineHref(summary.id)}
      className="absolute flex h-7 items-center gap-1.5 rounded-md border border-dashed px-2 text-xs whitespace-nowrap text-muted-foreground hover:text-foreground"
      style={{ left: `${left}%` }}
    >
      <AreaIcon area={look} className="size-4 rounded-sm border-0 bg-transparent [&_svg]:size-3" />
      {summary.title}
      {summary.next && <span className="text-faint">· {formatShortWeekday(summary.next)}</span>}
    </Link>
  );
}

/** Huecos entre una rutina y la siguiente que dan para algo. */
function freeGaps(routines: RoutineSummary[]) {
  return routines.slice(1).flatMap((summary, i) => {
    const from = routines[i]!.end;
    const to = summary.routine.start;
    const minutes = minutesBetween(from, to);
    return minutes >= MIN_FREE_MINUTES ? [{ from, to, minutes }] : [];
  });
}

function pad(hour: number): string {
  return String(hour).padStart(2, "0");
}
