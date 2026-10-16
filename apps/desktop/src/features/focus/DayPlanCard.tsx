import { minutesBetween, type DayPlanItem, type HabitValue, type RoutineStep } from "@rumbo/core";
import { CalendarPlusIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HabitTasks } from "@/features/habits/HabitTasks";
import { HabitValueControl } from "@/features/habits/HabitValueControl";
import { useHabitLook } from "@/hooks/useHabitLook";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DayEntry } from "./dayEntries";
import { RoutineRow } from "./RoutineRow";
import { TimelineRow } from "./TimelineRow";
import type { RoutineGroup } from "./useFocusDay";

interface DayPlanCardProps {
  entries: DayEntry[];
  time: string;
  current?: DayPlanItem;
  onToggleBlock: (item: Extract<DayPlanItem, { kind: "agenda" }>, done: boolean) => void;
  onHabitChange: (key: string, value: HabitValue) => void;
  onCompleteStep: (group: RoutineGroup, step: RoutineStep) => void;
}

/** "Tu día": rutinas, agenda y hábitos con hora, en orden. */
export function DayPlanCard({
  entries,
  time,
  current,
  onToggleBlock,
  onHabitChange,
  onCompleteStep,
}: DayPlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu día</CardTitle>
        <CardDescription>Tus rutinas y lo que toca, por hora</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        {entries.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarPlusIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay nada con hora</EmptyTitle>
              <EmptyDescription>
                Pulsa Ctrl N y escribe algo como «Java 17:00 2h», o ponle hora a un hábito.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          entries.map((entry) =>
            entry.kind === "routine" ? (
              <RoutineRow
                key={entry.group.summary.path}
                group={entry.group}
                time={time}
                onCompleteStep={onCompleteStep}
              />
            ) : (
              <PlanRow
                key={`${entry.item.kind}:${entry.start}:${entry.item.text}`}
                item={entry.item}
                isCurrent={entry.item === current}
                onToggleBlock={onToggleBlock}
                onHabitChange={onHabitChange}
              />
            ),
          )
        )}
      </CardContent>
    </Card>
  );
}

interface PlanRowProps extends Pick<DayPlanCardProps, "onToggleBlock" | "onHabitChange"> {
  item: DayPlanItem;
  isCurrent: boolean;
}

function PlanRow({ item, isCurrent, onToggleBlock, onHabitChange }: PlanRowProps) {
  const minutes = item.end ? minutesBetween(item.start, item.end) : undefined;
  const area = useHabitLook(item.kind === "habit" ? item.habit.habit : undefined);
  const habitTasks =
    item.kind === "habit" && item.habit.habit.kind === "tasks" ? item.habit : undefined;

  return (
    <TimelineRow
      time={item.start}
      current={isCurrent}
      marker={
        item.kind === "agenda" ? (
          <Checkbox
            checked={item.done}
            onCheckedChange={(checked) => onToggleBlock(item, checked === true)}
            aria-label={item.text}
          />
        ) : (
          <HabitValueControl
            habit={item.habit.habit}
            value={item.habit.today}
            todayTasks={habitTasks?.todayTasks}
            color={area.color}
            onChange={(value) => onHabitChange(item.habit.habit.key, value)}
          />
        )
      }
    >
      <AreaIcon area={area} className="size-10" />
      <div className="flex min-h-10 min-w-0 flex-1 flex-col justify-center">
        <p className={cn("truncate", item.done && "text-muted-foreground line-through")}>
          {item.text}
        </p>
        {item.kind === "habit" && <p className="text-sm text-muted-foreground">Hábito</p>}
        {/* Lo que vas a hacer hoy dentro de este hábito. */}
        {habitTasks && (
          <div className="mt-2 border-l pl-3">
            <HabitTasks habit={habitTasks.habit} tasks={habitTasks.todayTasks} />
          </div>
        )}
      </div>
      {minutes !== undefined && (
        <span className="pt-2.5 font-mono text-sm text-muted-foreground">
          {formatMinutes(minutes)}
        </span>
      )}
    </TimelineRow>
  );
}
