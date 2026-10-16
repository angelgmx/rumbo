import {
  addDays,
  isScheduledOn,
  type HabitSummary,
  type HabitValue,
  type IsoDate,
} from "@rumbo/core";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useArea } from "@/hooks/useArea";
import { capitalize, formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HabitMenu } from "./HabitDialogs";
import { HabitValueControl } from "./HabitValueControl";

interface WeekTrackerProps {
  habits: HabitSummary[];
  weekStart: IsoDate;
  today: IsoDate;
  onWeekChange: (weekStart: IsoDate) => void;
  onChange: (key: string, value: HabitValue, date: IsoDate) => void;
}

/** Tabla de la semana: una fila por hábito, una casilla por día, racha y cumplimiento. */
export function WeekTracker({
  habits,
  weekStart,
  today,
  onWeekChange,
  onChange,
}: WeekTrackerProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="border-b pb-4">
        <CardTitle>Esta semana</CardTitle>
        <CardDescription>
          Haz clic en una casilla para marcarla · en los de cantidad, escribe cuánto
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <span className="text-sm">
            {formatShortDay(days[0]!)} – {formatShortDay(days[6]!)}
          </span>
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
                  day === today && "bg-primary-soft text-primary-text",
                )}
              >
                {capitalize(formatShortDay(day))}
              </th>
            ))}
            <th className="w-24 font-normal">Racha</th>
            <th className="w-20 font-normal">Mejor</th>
            <th className="w-24 font-normal">30 días</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {habits.map((summary) => (
            <TrackerRow
              key={summary.habit.key}
              summary={summary}
              days={days}
              today={today}
              onChange={onChange}
            />
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
  onChange: WeekTrackerProps["onChange"];
}

function TrackerRow({ summary, days, today, onChange }: TrackerRowProps) {
  const { habit, history, streak, best, last30Days } = summary;
  const area = useArea(habit.area);
  const unit = streak.unit === "weeks" ? "sem" : "días";

  return (
    <tr className="border-b last:border-0">
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
          <div className="flex justify-center">
            {day > today ? (
              <span className="text-faint">·</span>
            ) : isScheduledOn(habit.schedule, day) ? (
              <HabitValueControl
                habit={habit}
                value={history.get(day)}
                todayTasks={
                  habit.kind === "tasks" && day === today ? summary.todayTasks : undefined
                }
                color={area.color}
                highlight={day === today}
                onChange={(value) => onChange(habit.key, value, day)}
              />
            ) : (
              <span className="text-faint">—</span>
            )}
          </div>
        </td>
      ))}
      <td className="text-center">
        <span className="text-base font-medium">{streak.count}</span>{" "}
        <span className="text-muted-foreground">{unit}</span>
      </td>
      <td className="text-center text-muted-foreground">{best.count}</td>
      <td>
        <div className="flex items-center justify-center gap-2">
          <ProgressRing
            value={last30Days}
            color={last30Days >= 0.8 ? "var(--success)" : "var(--warning)"}
          />
          <span className="font-mono text-xs text-muted-foreground">
            {Math.round(last30Days * 100)} %
          </span>
        </div>
      </td>
      <td className="pr-3">
        <HabitMenu summary={summary} />
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

function describeSchedule({ habit, challenge }: HabitSummary): string {
  const days =
    habit.schedule === "daily"
      ? "diario"
      : Array.isArray(habit.schedule)
        ? habit.schedule.map((day) => DAY_LETTERS[day]).join(" ")
        : `${habit.schedule.times_per_week} por semana`;
  const time = habit.start && habit.end ? ` · ${habit.start}–${habit.end}` : "";
  const reto = challenge ? ` · reto ${challenge.day}/${challenge.total}` : "";
  return days + time + reto;
}
