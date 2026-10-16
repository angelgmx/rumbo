import {
  addDays,
  habitProgress,
  isDone,
  startOfWeek,
  type HabitSummary,
  type IsoDate,
  type Streak,
} from "@rumbo/core";
import { Fragment, useState } from "react";
import { AreaIcon } from "@/components/AreaIcon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useHabitLook } from "@/hooks/useHabitLook";
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
const WEEKDAY_LABELS = ["lun", "", "mié", "", "vie", "", ""];

// Cuatro tonos del color del área, como en GitHub: más intenso cuanto más cerca del objetivo.
const LEVEL_OPACITY = [0, 0.3, 0.55, 0.8, 1];

/** Mapa de calor de un hábito, estilo GitHub: una columna por semana, una fila por día. */
export function YearHeatmap({ summary, today }: { summary: HabitSummary; today: IsoDate }) {
  const { habit, history, streak, best, challenge } = summary;
  const area = useHabitLook(habit);
  const years = yearsWithData(history, today);
  const [year, setYear] = useState(years[0]!);
  const doneDays = [...history].filter(
    ([date, value]) => date.startsWith(year) && isDone(habit, value),
  ).length;
  const level = (date: IsoDate) => Math.ceil(habitProgress(habit, history.get(date)) * 4);

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
        <CardAction className="flex flex-wrap items-center justify-end gap-2">
          {years.length > 1 && (
            <ToggleGroup
              value={[year]}
              onValueChange={(value) => value[0] && setYear(value[0])}
              variant="outline"
              size="sm"
            >
              {years.map((option) => (
                <ToggleGroupItem key={option} value={option}>
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          {challenge && (
            <Badge variant="outline" className="border-primary text-primary-text">
              {challenge.finished
                ? "Reto terminado"
                : `Reto · día ${challenge.day} de ${challenge.total}`}
            </Badge>
          )}
          <StreakBadge streak={streak} />
          <Badge variant="outline">mejor {formatStreak(best)}</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <YearGrid year={year} today={today} color={area.color} level={level} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{describeStats(summary)}</span>
          <Legend color={area.color} />
        </div>
      </CardContent>
    </Card>
  );
}

interface YearGridProps {
  year: string;
  today: IsoDate;
  color: string;
  level: (date: IsoDate) => number;
}

/** Rejilla de semanas: la primera columna son los días, cada semana ocupa una columna flexible. */
function YearGrid({ year, today, color, level }: YearGridProps) {
  const weeks = weeksOfYear(year);
  const days = Array.from({ length: 7 }, (_, row) => row);

  return (
    <div
      className="grid gap-[3px] text-[10px] text-muted-foreground"
      style={{ gridTemplateColumns: `1.75rem repeat(${weeks.length}, minmax(0, 1fr))` }}
    >
      <span />
      {weeks.map((week) => (
        <span key={week} className="overflow-visible whitespace-nowrap">
          {monthStartsIn(week, year)}
        </span>
      ))}
      {days.map((row) => (
        <Fragment key={row}>
          <span className="flex items-center">{WEEKDAY_LABELS[row]}</span>
          {weeks.map((week) => {
            const day = addDays(week, row);
            return (
              <HeatCell
                key={day}
                day={day}
                level={level(day)}
                color={color}
                hidden={!day.startsWith(year)}
                isToday={day === today}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

interface HeatCellProps {
  day: IsoDate;
  level: number;
  color: string;
  hidden: boolean;
  isToday: boolean;
}

function HeatCell({ day, level, color, hidden, isToday }: HeatCellProps) {
  return (
    <span
      title={day}
      className={cn(
        "aspect-square w-full rounded-[3px] bg-muted",
        hidden && "invisible",
        isToday && "ring-2 ring-foreground",
      )}
      style={level > 0 ? { backgroundColor: color, opacity: LEVEL_OPACITY[level] } : undefined}
    />
  );
}

function Legend({ color }: { color: string }) {
  return (
    <span className="flex items-center gap-1">
      menos
      {LEVEL_OPACITY.map((opacity, i) => (
        <span
          key={i}
          className="size-3 rounded-[3px] bg-muted"
          style={i > 0 ? { backgroundColor: color, opacity } : undefined}
        />
      ))}
      más
    </span>
  );
}

/** Verde si la racha sigue viva, rojo si se ha roto. */
function StreakBadge({ streak }: { streak: Streak }) {
  const alive = streak.count > 0;
  return (
    <Badge
      variant="outline"
      className={
        alive ? "border-success/40 text-success" : "border-destructive/40 text-destructive"
      }
    >
      <span className={cn("size-1.5 rounded-full", alive ? "bg-success" : "bg-destructive")} />
      racha {formatStreak(streak)}
    </Badge>
  );
}

function formatStreak(streak: Streak): string {
  return `${streak.count} ${streak.unit === "weeks" ? "sem" : "d"}`;
}

/** "1 240 min en total · mejor día: martes" */
function describeStats({ habit, stats }: HabitSummary): string {
  const parts: string[] = [];
  if (stats.amount > 0) parts.push(`${stats.amount.toLocaleString("es")} ${habit.unit} en total`);
  if (stats.bestWeekday) parts.push(`mejor día: ${WEEKDAY_NAMES[stats.bestWeekday]}`);
  return parts.join(" · ");
}

/** Este año y los anteriores con algún registro, del más reciente al más antiguo. */
function yearsWithData(history: HabitSummary["history"], today: IsoDate): string[] {
  const years = new Set([today.slice(0, 4)]);
  for (const date of history.keys()) years.add(date.slice(0, 4));
  return [...years].sort().reverse();
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
