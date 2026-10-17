import {
  addDays,
  habitProgress,
  isScheduledOn,
  type Habit,
  isDone,
  type HabitSummary,
  type HabitValue,
  type IsoDate,
} from "@rumbo/core";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabitLook } from "@/hooks/useHabitLook";
import { capitalize, formatDayMonth, formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HabitMenu } from "./HabitDialogs";
import { HabitMark, tasksProgress } from "./HabitMark";

interface WeekTrackerProps {
  habits: HabitSummary[];
  weekStart: IsoDate;
  today: IsoDate;
  onWeekChange: (weekStart: IsoDate) => void;
}

/** Tabla de la semana: una fila por hábito, una casilla por día, racha y cumplimiento. */
export function WeekTracker({ habits, weekStart, today, onWeekChange }: WeekTrackerProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="border-b pb-4">
        <CardTitle>Esta semana</CardTitle>
        <CardDescription>
          Haz clic en una casilla para marcarla; los de tareas se cumplen con las suyas
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <span className="text-sm font-medium">{formatWeekRange(days[0]!, days[6]!)}</span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Semana anterior"
            onClick={() => onWeekChange(addDays(weekStart, -7))}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Semana siguiente"
            onClick={() => onWeekChange(addDays(weekStart, 7))}
          >
            <ChevronRightIcon />
          </Button>
        </CardAction>
      </CardHeader>

      <table className="w-full text-sm">
        <thead className="text-muted-foreground">
          <tr className="border-b">
            <th className="px-6 py-3 text-left font-normal">Hábito</th>
            {days.map((day) => (
              <th
                key={day}
                className={cn(
                  "w-20 font-normal",
                  day === today && "bg-primary-soft font-medium text-primary-text",
                )}
              >
                {capitalize(formatShortDay(day))}
              </th>
            ))}
            <th className="w-24 font-normal">Racha</th>
            <th className="w-20 font-normal">Mejor</th>
            <th className="w-24 font-normal">30 días</th>
            <th className="w-12">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {habits.map((summary) => (
            <TrackerRow key={summary.habit.key} summary={summary} days={days} today={today} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}

interface TrackerRowProps {
  summary: HabitSummary;
  days: IsoDate[];
  today: IsoDate;
}

function TrackerRow({ summary, days, today }: TrackerRowProps) {
  const { habit, history, streak, best, last30Days } = summary;
  const area = useHabitLook(habit);
  const unit = streak.unit === "weeks" ? "sem" : "días";

  return (
    <tr className="group border-b last:border-0">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <AreaIcon area={area} />
          <div>
            <div>{habit.name}</div>
            <div className="font-mono text-xs text-muted-foreground">
              {describeSchedule(summary)}
            </div>
          </div>
        </div>
      </td>
      {days.map((day) => (
        <td key={day} className={cn("text-center", day === today && "bg-primary-soft")}>
          <div className="flex flex-col items-center gap-1 py-1">
            {day > today ? (
              <FutureDay />
            ) : isScheduledOn(habit.schedule, day) ? (
              <HabitMark
                summary={summary}
                done={isDone(habit, history.get(day))}
                date={day}
                progress={day === today ? tasksProgress(summary.todayTasks) : 0}
                className="size-7 rounded-md"
              />
            ) : (
              <span className="text-faint">—</span>
            )}
            <PartialAmount habit={habit} value={history.get(day)} />
          </div>
        </td>
      ))}
      <td className="text-center">
        <span className="text-base font-medium">{streak.count}</span>{" "}
        <span className="text-muted-foreground">{unit}</span>
      </td>
      <td className="text-center text-muted-foreground">{best.count}</td>
      <td>
        <div className="flex justify-center">
          <span className="relative flex">
            <ProgressRing
              value={last30Days}
              color={last30Days >= 0.8 ? "var(--success)" : "var(--warning)"}
              size={34}
            />
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-muted-foreground">
              {Math.round(last30Days * 100)}%
            </span>
          </span>
        </div>
      </td>
      <td className="pr-3">
        {/* Editar o archivar es poco frecuente: el menú solo aparece al pasar por la fila. */}
        <div className="opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100 focus-within:opacity-100">
          <HabitMenu summary={summary} />
        </div>
      </td>
    </tr>
  );
}

const DAY_LETTERS: Record<string, string> = {
  mon: "L",
  tue: "M",
  wed: "X",
  thu: "J",
  fri: "V",
  sat: "S",
  sun: "D",
};

/** "15/30" bajo la casilla cuando un hábito de cantidad va a medias. */
function PartialAmount({ habit, value }: { habit: Habit; value: HabitValue | undefined }) {
  const progress = habitProgress(habit, value);
  if (typeof value !== "number" || progress === 0 || progress >= 1) return null;
  return (
    <span className="font-mono text-[10px] text-muted-foreground">
      {value}/{habit.target}
    </span>
  );
}

/** Una casilla vacía para los días que aún no han llegado. */
function FutureDay() {
  return <span aria-hidden className="size-7 rounded-md border border-dashed opacity-50" />;
}

/** "diario · 30 min", "L M J V", "3 por semana · reto 4/30" */
function describeSchedule({ habit, challenge }: HabitSummary): string {
  const days =
    habit.schedule === "daily"
      ? "diario"
      : Array.isArray(habit.schedule)
        ? habit.schedule.map((day) => DAY_LETTERS[day]).join(" ")
        : `${habit.schedule.times_per_week} por semana`;
  const parts = [days];
  if (habit.target && habit.unit) parts.push(`${habit.target} ${habit.unit}`);
  if (challenge) parts.push(`reto ${challenge.day}/${challenge.total}`);
  return parts.join(" · ");
}

/** "12 – 18 oct", o "29 sep – 5 oct" si la semana cambia de mes. */
function formatWeekRange(first: IsoDate, last: IsoDate): string {
  const end = formatDayMonth(last);
  const sameMonth = first.slice(5, 7) === last.slice(5, 7);
  return `${sameMonth ? Number(first.slice(8)) : formatDayMonth(first)} – ${end}`;
}
