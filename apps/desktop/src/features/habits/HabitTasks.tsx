import type { Habit, Task } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Checkbox } from "@/components/ui/checkbox";
import { StepsChip } from "@/features/tasks/StepsChip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/** Las tareas de hoy de un hábito: se marcan aquí y se añaden nuevas, ya vinculadas al hábito. */
export function HabitTasks({ habit, tasks }: { habit: Habit; tasks: Task[] }) {
  const rumbo = useRumbo();
  const [text, setText] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    await rumbo.tasks.create({
      text,
      scheduled: rumbo.daily.today(),
      habit: habit.key,
      area: habit.area,
    });
    setText("");
  }

  return (
    <div className="flex flex-col gap-1">
      {tasks.length === 0 && (
        <p className="px-2 py-1 text-sm text-muted-foreground">
          Sin tareas para hoy. Añade lo que vas a hacer.
        </p>
      )}
      {tasks.map((task) => (
        <label
          key={task.id}
          className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
        >
          <Checkbox
            checked={task.done}
            onCheckedChange={(checked) => rumbo.tasks.setDone(task, checked === true)}
          />
          <span className={cn("flex-1 text-sm", task.done && "text-muted-foreground line-through")}>
            {task.text}
          </span>
          <StepsChip steps={task.steps} />
        </label>
      ))}
      <form onSubmit={add} className="mt-1">
        <InputGroup>
          <InputGroupInput
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Tarea de hoy: «Tema: Arrays»…"
            aria-label={`Nueva tarea de ${habit.name}`}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              size="icon-xs"
              aria-label="Añadir tarea"
              disabled={!text.trim()}
            >
              <PlusIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
