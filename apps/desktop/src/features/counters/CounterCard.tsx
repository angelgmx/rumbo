import { stepCounter, type Counter, type TaskStep } from "@rumbo/core";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatList } from "@/lib/format";
import { CounterBar } from "./CounterBar";
import { COUNTER_INFO } from "./counterKinds";
import { CounterTypeMenu } from "./CounterTypeMenu";

/**
 * El contador de la tarea en grande: tipo, cantidad, − y +, y cómo va.
 */
export function CounterCard({
  counter,
  steps,
  onChange,
}: {
  counter: Counter;
  steps: TaskStep[];
  onChange: (counter: Counter | undefined) => void;
}) {
  const { label, icon: Icon, unit } = COUNTER_INFO[counter.kind];
  const step = (delta: number) => onChange(stepCounter(counter, delta));

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-primary-soft p-4">
      <header className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-primary-text uppercase">
          <Icon className="size-3.5" />
          Contador · {label}
        </span>
        <CounterTypeMenu
          value={counter}
          onChange={onChange}
          trigger={
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Cambiar tipo
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          }
        />
      </header>

      <div className="flex items-center gap-3">
        <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
          {counter.current}
        </span>
        <span className="mr-auto text-muted-foreground">
          / {counter.target}
          {unit && ` ${unit}`}
        </span>
        {counter.kind !== "minutes" && (
          <>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => step(-1)}
              disabled={counter.current === 0}
              aria-label="Quitar uno"
            >
              <MinusIcon />
            </Button>
            <Button size="icon-lg" onClick={() => step(1)} aria-label="Sumar uno">
              <PlusIcon />
            </Button>
          </>
        )}
      </div>

      <CounterBar counter={counter} />
      {counter.kind === "progress" && <StepsSummary steps={steps} />}
    </section>
  );
}

function StepsSummary({ steps }: { steps: TaskStep[] }) {
  if (steps.length === 0) return null;
  const done = steps.filter((step) => step.done).length;
  const pending = steps.filter((step) => !step.done).map((step) => step.text);

  return (
    <p className="truncate text-xs text-muted-foreground">
      {done} de {steps.length} pasos hechos
      {pending.length > 0 && ` · faltan ${formatList(pending)}`}
    </p>
  );
}
