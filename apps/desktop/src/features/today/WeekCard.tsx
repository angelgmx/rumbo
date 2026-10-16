import type { DayProgress, IsoDate } from "@rumbo/core";
import { ChartColumnIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "Tu semana": cuánto del plan se cumplió cada día. El único gráfico de Hoy. */
export function WeekCard({ week, today }: { week: DayProgress[]; today: IsoDate }) {
  const todayProgress = week.find((day) => day.date === today);
  const percent =
    todayProgress && todayProgress.planned > 0
      ? Math.round((todayProgress.done / todayProgress.planned) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartColumnIcon className="size-4" />
          Tu semana
        </CardTitle>
        <CardAction className="text-sm text-muted-foreground">plan cumplido</CardAction>
      </CardHeader>
      <CardContent className="grid h-32 grid-cols-7 gap-2">
        {week.map((day) => (
          <DayBar
            key={day.date}
            day={day}
            isToday={day.date === today}
            isFuture={day.date > today}
          />
        ))}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">Hoy vas por el {percent} %.</CardFooter>
    </Card>
  );
}

function DayBar({
  day,
  isToday,
  isFuture,
}: {
  day: DayProgress;
  isToday: boolean;
  isFuture: boolean;
}) {
  const ratio = day.planned > 0 ? day.done / day.planned : 0;
  const label = formatShortDay(day.date).slice(0, 1).toUpperCase();

  return (
    <div
      className="flex flex-col items-center gap-2"
      title={`${formatShortDay(day.date)}: ${day.done} de ${day.planned}`}
    >
      <div className="flex w-full flex-1 items-end overflow-hidden rounded-md bg-muted">
        {!isFuture && (
          <div
            className={cn(
              "w-full rounded-md transition-[height] duration-(--dur-page) ease-(--ease-enter)",
              isToday ? "bg-primary" : "bg-success",
            )}
            style={{ height: `${Math.max(ratio * 100, ratio > 0 ? 8 : 0)}%` }}
          />
        )}
      </div>
      <span
        className={cn("text-xs text-muted-foreground", isToday && "font-medium text-primary-text")}
      >
        {label}
      </span>
    </div>
  );
}
