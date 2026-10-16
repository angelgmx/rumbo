import type { HabitSummary, RoutineSummary } from "@rumbo/core";
import { ClockIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { Card } from "@/components/ui/card";
import { useArea } from "@/hooks/useArea";
import { formatMinutes } from "@/lib/format";
import { WeekdayChips } from "../WeekdayChips";

/** La fila de datos de la rutina: días, hora de inicio, duración, fin y el hábito que marca. */
export function RoutineSettings({ summary }: { summary: RoutineSummary }) {
  const rumbo = useRumbo();
  const { routine } = summary;
  const [mainHabit] = summary.habits;

  return (
    <Card className="flex-row gap-0 divide-x p-0">
      <Cell label="Días">
        <WeekdayChips
          schedule={routine.days}
          onChange={(days) => rumbo.routines.update(summary.path, { days })}
        />
      </Cell>
      <Cell label="Empieza">
        <label className="flex h-8 w-fit items-center gap-2 rounded-lg border px-2.5">
          <ClockIcon className="size-3.5 text-muted-foreground" />
          <input
            type="time"
            aria-label="Hora de inicio"
            value={routine.start.padStart(5, "0")}
            onChange={(event) =>
              event.target.value &&
              rumbo.routines.update(summary.path, { start: event.target.value })
            }
            className="bg-transparent font-mono text-sm outline-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </label>
      </Cell>
      <Cell label="Duración">
        <span className="text-lg font-medium">{formatMinutes(summary.minutes)}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">calculada</span>
      </Cell>
      <Cell label="Termina">
        <span className="font-mono text-lg">{summary.end}</span>
      </Cell>
      {mainHabit && (
        <Cell label="Hábito que marca" grow>
          <MainHabit summary={mainHabit} />
        </Cell>
      )}
    </Card>
  );
}

function Cell({
  label,
  children,
  grow = false,
}: {
  label: string;
  children: ReactNode;
  grow?: boolean;
}) {
  return (
    <div className={grow ? "min-w-0 flex-1 px-5 py-3.5" : "shrink-0 px-5 py-3.5"}>
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <div className="flex h-8 items-center">{children}</div>
    </div>
  );
}

function MainHabit({ summary }: { summary: HabitSummary }) {
  const area = useArea(summary.habit.area);
  const { start, end } = summary.habit;
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <AreaIcon area={area} />
      <span className="truncate font-medium">{summary.habit.name}</span>
      {start && end && (
        <span className="font-mono text-xs text-muted-foreground">
          {start}–{end}
        </span>
      )}
    </span>
  );
}
