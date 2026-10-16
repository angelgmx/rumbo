import type { IsoDate, RoutineSummary } from "@rumbo/core";
import { PlayIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { timeOf, useNow } from "@/hooks/useNow";
import { capitalize, formatDayMonth, formatMinutes } from "@/lib/format";
import { DayTimeline } from "./DayTimeline";
import { useRoutineLook } from "./look";
import { useStartRoutine } from "./useStartRoutine";

const weekdayFormat = new Intl.DateTimeFormat("es", { weekday: "long" });

interface TodayCardProps {
  date: IsoDate;
  today: RoutineSummary[];
  other: RoutineSummary[];
}

/** «Tu jueves»: la franja del día a la izquierda y, a la derecha, cuánto hay hoy y qué viene. */
export function TodayCard({ date, today, other }: TodayCardProps) {
  const now = timeOf(useNow());
  const next = today.find((summary) => summary.end > now);
  const total = today.reduce((sum, summary) => sum + summary.minutes, 0);

  return (
    <Card className="flex-row gap-0 p-0">
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <h2 className="mb-3 flex items-baseline gap-2">
          <span className="font-medium">Tu {weekdayFormat.format(new Date(`${date}T12:00`))}</span>
          <span className="text-sm text-muted-foreground">{formatDayMonth(date)}</span>
        </h2>
        <div className="my-auto">
          <DayTimeline today={today} other={other} />
        </div>
      </div>

      <aside className="flex w-72 shrink-0 flex-col gap-4 border-l p-5">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-faint uppercase">Hoy</p>
          <p className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight">
              {today.length} {today.length === 1 ? "rutina" : "rutinas"}
            </span>
            <span className="text-sm text-muted-foreground">{formatMinutes(total)}</span>
          </p>
          <TodayShare routines={today} />
        </div>
        {next ? (
          <NextRoutine summary={next} started={next.routine.start <= now} />
        ) : (
          <p className="rounded-xl border p-4 text-sm text-muted-foreground">
            {capitalize(today.length > 0 ? "hoy ya no queda ninguna" : "hoy no toca ninguna")}.
          </p>
        )}
      </aside>
    </Card>
  );
}

/** Una barra por rutina, tan larga como su duración, en su color. */
function TodayShare({ routines }: { routines: RoutineSummary[] }) {
  return (
    <div className="mt-3 flex h-1.5 gap-1">
      {routines.map((summary) => (
        <ShareSegment key={summary.id} summary={summary} />
      ))}
    </div>
  );
}

function ShareSegment({ summary }: { summary: RoutineSummary }) {
  const look = useRoutineLook(summary.routine);
  return (
    <span
      className="rounded-full"
      style={{ flexGrow: summary.minutes, flexBasis: 0, background: look.color }}
    />
  );
}

function NextRoutine({ summary, started }: { summary: RoutineSummary; started: boolean }) {
  const look = useRoutineLook(summary.routine);
  const start = useStartRoutine();

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-background/40 p-4">
      <p className="font-mono text-[11px] tracking-widest text-faint uppercase">
        {started ? "Ahora" : "Siguiente"}
      </p>
      <div className="flex items-center gap-2.5">
        <AreaIcon area={look} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{summary.title}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {summary.routine.start} – {summary.end} · {formatMinutes(summary.minutes)}
          </p>
        </div>
      </div>
      <Button className="w-full" onClick={() => start(summary)}>
        <PlayIcon data-icon="inline-start" />
        Empezar
      </Button>
    </div>
  );
}
