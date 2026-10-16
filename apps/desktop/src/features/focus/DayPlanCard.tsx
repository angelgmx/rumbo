import { minutesBetween, type DayPlanItem, type HabitValue, type RoutineStep } from "@rumbo/core";
import { CalendarPlusIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { Badge } from "@/components/ui/badge";
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
import { useArea } from "@/hooks/useArea";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DayEntry } from "./dayEntries";
import { RoutineRow } from "./RoutineRow";
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
      <CardContent className="flex flex-col gap-1">
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

  const habitTasks =
    item.kind === "habit" && item.habit.habit.kind === "tasks" ? item.habit : undefined;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-(--dur-fast)",
        isCurrent && "border-primary/60 bg-primary-soft",
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "w-12 font-mono text-sm text-muted-foreground",
            isCurrent && "text-primary-text",
          )}
        >
          {item.start}
        </span>
        {item.kind === "agenda" ? (
          <Checkbox
            checked={item.done}
            onCheckedChange={(checked) => onToggleBlock(item, checked === true)}
            aria-label={item.text}
          />
        ) : (
          <HabitControl item={item} onChange={onHabitChange} />
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            item.done && "text-muted-foreground line-through",
          )}
        >
          {item.text}
        </span>
        {item.kind === "habit" && <Badge variant="outline">hábito</Badge>}
        {minutes !== undefined && (
          <span className="font-mono text-sm text-muted-foreground">{formatMinutes(minutes)}</span>
        )}
        {item.done && (
          <Badge variant="secondary" className="text-success">
            Hecho
          </Badge>
        )}
      </div>
      {/* Lo que vas a hacer hoy dentro de este hábito. */}
      {habitTasks && (
        <div className="mt-2 ml-16 border-l pl-3">
          <HabitTasks habit={habitTasks.habit} tasks={habitTasks.todayTasks} />
        </div>
      )}
    </div>
  );
}

function HabitControl({
  item,
  onChange,
}: {
  item: Extract<DayPlanItem, { kind: "habit" }>;
  onChange: DayPlanCardProps["onHabitChange"];
}) {
  const { habit, today } = item.habit;
  const area = useArea(habit.area);
  return (
    <div className="flex items-center gap-2">
      <HabitValueControl
        habit={habit}
        value={today}
        todayTasks={habit.kind === "tasks" ? item.habit.todayTasks : undefined}
        color={area.color}
        onChange={(value) => onChange(habit.key, value)}
      />
      <AreaIcon area={area} />
    </div>
  );
}
