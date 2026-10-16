import type { Counter, TaskStep } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { CounterCard } from "@/features/counters/CounterCard";
import { CounterTypeMenu } from "@/features/counters/CounterTypeMenu";

/** El contador de la tarea, protagonista; sin contador, un botón para ponerle uno. */
export function TaskCounter({
  counter,
  steps,
  onChange,
}: {
  counter: Counter | undefined;
  steps: TaskStep[];
  onChange: (counter: Counter | undefined) => void;
}) {
  if (counter) return <CounterCard counter={counter} steps={steps} onChange={onChange} />;

  return (
    <CounterTypeMenu
      value={undefined}
      onChange={onChange}
      trigger={
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <PlusIcon className="size-4" />
          Añadir contador
        </button>
      }
    />
  );
}
