import {
  addDays,
  habitProgress,
  isDone,
  startOfWeek,
  type HabitSummary,
  type IsoDate,
} from "@rumbo/core";
import { AreaIcon } from "@/components/AreaIcon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";

const WEEKDAY_NAMES = {
  mon: "lunes",
  tue: "martes",
  wed: "miércoles",
  thu: "jueves",
  fri: "viernes",
  sat: "sábado",
  sun: "domingo",
} as const;

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Mapa de calor del año, estilo GitHub: una columna por semana, una fila por día. */
export function YearHeatmap({ summary, today }: { summary: HabitSummary; today: IsoDate }) {
  const { habit, history, streak, best, stats, challenge } = summary;
  const area = useArea(habit.area);
  const year = today.slice(0, 4);
  const weeks = weeksOfYear(year);
  const doneDays = [...history].filter(
    ([date, value]) => date.startsWith(year) && isDone(habit, value),
  ).length;

  // Más intenso cuanto más cerca del objetivo.
  const intensity = (date: IsoDate): number => habitProgress(habit, history.get(date));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <AreaIcon area={area} />
          <div>
            <CardTitle>{habit.name}</CardTitle>
            <CardDescription className="font-mono">
              {doneDays} días cumplidos en {year}
            </CardDescription>
          </div>
        </div>
        <CardAction className="flex flex-wrap justify-end gap-2">
          {challenge && (
            <Badge variant="outline" className="border-primary text-primary-text">
              {challenge.finished
                ? "Reto terminado"
                : `Reto · día ${challenge.day} de ${challenge.total}`}
            </Badge>
          )}
          <Badge variant="outline">racha {streak.count}</Badge>
          <Badge variant="outline">mejor {best.count}</Badge>
          {stats.amount > 0 && (
            <Badge variant="outline">
              {stats.amount.toLocaleString("es")} {habit.unit} en total
            </Badge>
          )}
          {stats.bestWeekday && (
            <Badge variant="outline">mejor día: {WEEKDAY_NAMES[stats.bestWeekday]}</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 overflow-x-auto">
        <div className="flex gap-[3px] pl-8 text-xs text-muted-foreground">
          {weeks.map((week) => (
            <span key={week} className="w-3 shrink-0 overflow-visible whitespace-nowrap">
              {monthStartsIn(week, year) ?? ""}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          <div className="flex w-8 flex-col justify-between py-0.5 text-xs text-muted-foreground">
            <span>lun</span>
            <span>jue</span>
            <span>dom</span>
          </div>
          {weeks.map((week) => (
            <div key={week} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, i) => addDays(week, i)).map((day) => (
                <span
                  key={day}
                  title={day}
                  className={cn(
                    "size-3 rounded-[3px] bg-muted",
                    !day.startsWith(year) && "invisible",
                    day === today && "ring-1 ring-foreground",
                  )}
                  style={
                    intensity(day) > 0
                      ? { backgroundColor: area.color, opacity: 0.35 + intensity(day) * 0.65 }
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function weeksOfYear(year: string): IsoDate[] {
  const weeks: IsoDate[] = [];
  for (let week = startOfWeek(`${year}-01-01`); week <= `${year}-12-31`; week = addDays(week, 7))
    weeks.push(week);
  return weeks;
}

/** El nombre del mes si empieza en esa semana, para la fila de arriba. */
function monthStartsIn(weekStart: IsoDate, year: string): string | undefined {
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    if (day.startsWith(year) && day.endsWith("-01")) return MONTHS[Number(day.slice(5, 7)) - 1];
  }
  return undefined;
}
