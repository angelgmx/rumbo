import type { Task } from "@rumbo/core";
import { ChevronDownIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";

/** Un grupo plegable de tareas del panel: «Sin fecha» o «Esta semana». */
export function TaskGroup({
  title,
  tasks,
  placeholder,
}: {
  title: string;
  tasks: Task[];
  /** Lo que se enseña en lugar de las tareas mientras se arrastra una de ellas. */
  placeholder?: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-left text-[14px]"
      >
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            !open && "-rotate-90",
          )}
        />
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground">{tasks.length}</span>
      </button>
      {open && (
        <ul className="flex flex-col gap-2">
          {placeholder}
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}
