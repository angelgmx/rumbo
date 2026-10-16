import type { TaskDraft } from "@rumbo/core";
import {
  CheckIcon,
  ClockIcon,
  HashIcon,
  SparklesIcon,
  TimerIcon,
  ToggleRightIcon,
} from "lucide-react";

/** «Genera hoy 3 tareas»: lo que creará este bloque de tema al empezar la rutina. */
export function ModuleTasksPreview({ tasks }: { tasks: TaskDraft[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border bg-background/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-primary-text uppercase">
          <SparklesIcon className="size-3" />
          Genera hoy {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"}
        </span>
        <span className="text-xs text-faint">de los recursos del módulo</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {tasks.map((task) => (
          <li key={task.text} className="flex items-center gap-2.5 text-sm">
            <span className="size-3.5 rounded-sm border" aria-hidden />
            <span className="flex-1 truncate">{shortText(task.text)}</span>
            <CounterChip task={task} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CounterChip({ task }: { task: TaskDraft }) {
  const { counter } = task;
  const className =
    "flex h-6 items-center gap-1 rounded-md border px-2 font-mono text-xs text-muted-foreground";

  if (!counter) {
    return (
      <span className={className}>
        <CheckIcon className="size-3" />
        Casilla
      </span>
    );
  }
  if (counter.kind === "minutes") {
    return (
      <span className={className}>
        <ClockIcon className="size-3" />
        {counter.target} min
      </span>
    );
  }
  const Icon = { progress: ToggleRightIcon, pomodoro: TimerIcon, count: HashIcon }[counter.kind];
  return (
    <span className={className}>
      <Icon className="size-3" />
      {counter.current} / {counter.target}
    </span>
  );
}

// Las tareas llevan delante «Ruta · Tema:»; dentro del bloque ya se sabe de qué tema son.
function shortText(text: string): string {
  const [, rest] = text.split(/:\s(.+)/);
  return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : text;
}
