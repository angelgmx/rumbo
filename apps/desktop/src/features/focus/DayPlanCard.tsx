import { minutesBetween, type DayPlanItem, type HabitValue } from "@rumbo/core";
import { CalendarPlusIcon, PlayIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DayPlanCardProps {
  items: DayPlanItem[];
  current?: DayPlanItem;
  onToggleBlock: (item: Extract<DayPlanItem, { kind: "agenda" }>, done: boolean) => void;
  onHabitChange: (key: string, value: HabitValue) => void;
  onStart: (item: DayPlanItem) => void;
}

/** "Tu día": la agenda y los hábitos con hora, en orden. Es tu rutina de hoy. */
export function DayPlanCard({
  items,
  current,
  onToggleBlock,
  onHabitChange,
  onStart,
}: DayPlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu día</CardTitle>
        <CardDescription>
          Tu agenda y tus hábitos con hora · marca cada cosa al terminarla
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {items.length === 0 ? (
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
          items.map((item) => (
            <PlanRow
              key={`${item.kind}:${item.start}:${item.text}`}
              item={item}
              isCurrent={item === current}
              onToggleBlock={onToggleBlock}
              onHabitChange={onHabitChange}
              onStart={() => onStart(item)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface PlanRowProps extends Omit<DayPlanCardProps, "items" | "current" | "onStart"> {
  item: DayPlanItem;
  isCurrent: boolean;
  onStart: () => void;
}

function PlanRow({ item, isCurrent, onToggleBlock, onHabitChange, onStart }: PlanRowProps) {
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
        {item.done ? (
          <Badge variant="secondary" className="text-success">
            Hecho
          </Badge>
        ) : isCurrent ? (
          <Button size="sm" onClick={onStart}>
            <PlayIcon data-icon="inline-start" />
            Empezar
          </Button>
        ) : null}
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
