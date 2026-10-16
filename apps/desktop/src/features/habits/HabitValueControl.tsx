import type { Habit, HabitValue, Task } from "@rumbo/core";
import { habitProgress, isDone } from "@rumbo/core";
import { CheckIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HabitTasks } from "./HabitTasks";

interface HabitValueControlProps {
  habit: Habit;
  value: HabitValue | undefined;
  color: string;
  onChange: (value: HabitValue) => void;
  /** Día de hoy en el tracker: se marca con el acento si aún no está hecho. */
  highlight?: boolean;
  /** Hábitos de tareas: las de hoy. En otros días no se pasan y la casilla solo informa. */
  todayTasks?: Task[];
}

/** La casilla de un hábito en un día. Los de sí/no se marcan de un clic; el resto abre un panel. */
export function HabitValueControl(props: HabitValueControlProps) {
  const { habit, value, color, onChange, highlight } = props;
  const done = isDone(habit, value);

  if (habit.kind === "check") {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={habit.name}
        onClick={() => onChange(!done)}
        className={cn(
          "flex size-7 items-center justify-center rounded-md border transition-all duration-(--dur-fast) active:scale-95",
          highlight && !done && "border-primary",
        )}
        style={done ? { backgroundColor: color, borderColor: color } : undefined}
      >
        {done && <CheckIcon className="size-4 text-white" strokeWidth={3} />}
      </button>
    );
  }

  return <PanelControl {...props} />;
}

function PanelControl({
  habit,
  value,
  color,
  onChange,
  highlight,
  todayTasks,
}: HabitValueControlProps) {
  const [open, setOpen] = useState(false);
  const progress = todayTasks ? tasksProgress(todayTasks) : habitProgress(habit, value);
  const done = progress >= 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`${habit.name}: ${describeValue(habit, value, todayTasks)}`}
            disabled={habit.kind === "tasks" && !todayTasks}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-transform duration-(--dur-fast) active:scale-95",
              progress === 0 && "border",
              highlight && !done && progress === 0 && "border-primary",
            )}
            style={done ? { backgroundColor: color } : undefined}
          />
        }
      >
        {done ? (
          <CheckIcon className="size-4 text-white" strokeWidth={3} />
        ) : progress > 0 ? (
          <ProgressRing value={progress} color={color} size={26} />
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="mb-3 font-medium">{habit.name}</p>
        {habit.kind === "tasks" ? (
          <HabitTasks habit={habit} tasks={todayTasks ?? []} />
        ) : (
          <AmountPanel
            habit={habit}
            value={value}
            onSave={(amount) => {
              onChange(amount);
              setOpen(false);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function AmountPanel({
  habit,
  value,
  onSave,
}: {
  habit: Habit;
  value: HabitValue | undefined;
  onSave: (amount: number) => void;
}) {
  const amount = typeof value === "number" ? value : 0;
  const target = habit.target ?? 1;
  const step = Math.max(1, Math.ceil(target / 4));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(Math.max(0, Number(new FormData(event.currentTarget).get("amount")) || 0));
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupInput
          name="amount"
          type="number"
          min={0}
          defaultValue={amount || ""}
          autoFocus
          aria-label="Cantidad"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>
            de {target} {habit.unit}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onSave(amount + step)}>
          +{step}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onSave(target)}>
          Completo
        </Button>
        <Button type="submit" size="sm" className="ml-auto">
          Guardar
        </Button>
      </div>
    </form>
  );
}

/** "12/20 páginas", "1/2 tareas", "hecho"… */
export function describeValue(
  habit: Habit,
  value: HabitValue | undefined,
  todayTasks?: Task[],
): string {
  if (habit.kind === "check") return value === true ? "hecho" : "sin hacer";
  if (habit.kind === "tasks") {
    if (!todayTasks) return value === true ? "hecho" : "sin hacer";
    return `${todayTasks.filter((task) => task.done).length}/${todayTasks.length} tareas`;
  }
  return `${typeof value === "number" ? value : 0}/${habit.target ?? 1} ${habit.unit ?? ""}`.trim();
}

/** Parte de las tareas terminadas. Sin tareas no hay nada hecho. */
function tasksProgress(tasks: Task[]): number {
  return tasks.length === 0 ? 0 : tasks.filter((task) => task.done).length / tasks.length;
}
