import { linkTarget, type Counter, type Task } from "@rumbo/core";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CounterControl } from "@/features/counters/CounterControl";
import { COUNTER_INFO } from "@/features/counters/counterKinds";
import { CounterPicker } from "@/features/counters/CounterPicker";
import { hasCounter } from "@/features/counters/countedTask";
import { formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { noteName, PRIORITY_LABEL } from "./taskLabels";

/**
 * Detalle de una tarea en un panel lateral: su contador en marcha y sus propiedades.
 * Solo enseña lo que la tarea guarda de verdad en el vault.
 */
export function TaskDetailSheet({ task, onClose }: { task?: Task; onClose: () => void }) {
  return (
    <Sheet open={task !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {task && <TaskDetail task={task} />}
      </SheetContent>
    </Sheet>
  );
}

function TaskDetail({ task }: { task: Task }) {
  const rumbo = useRumbo();
  const date = task.scheduled ?? task.due;

  return (
    <>
      <header className="flex flex-col gap-3 border-b p-6 pr-12">
        <div className="flex items-start gap-3">
          <Checkbox
            className="mt-1.5"
            checked={task.done}
            onCheckedChange={(checked) => rumbo.tasks.setDone(task, checked === true)}
            aria-label="Hecha"
          />
          <SheetTitle className={cn("text-xl", task.done && "text-muted-foreground line-through")}>
            {task.text}
          </SheetTitle>
        </div>
        <SheetDescription render={<div />} className="flex flex-wrap gap-1.5 pl-7">
          {task.priority && <Badge variant="outline">{PRIORITY_LABEL[task.priority]}</Badge>}
          {date && <Badge variant="outline">{formatShortDay(date)}</Badge>}
          {task.done && <Badge variant="secondary">Hecha</Badge>}
        </SheetDescription>
      </header>

      <div className="flex flex-col gap-8 p-6">
        <CounterSection task={task} onChange={(counter) => rumbo.tasks.setCounter(task, counter)} />
        <Properties task={task} />
      </div>
    </>
  );
}

function CounterSection({
  task,
  onChange,
}: {
  task: Task;
  onChange: (counter: Counter | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const change = (counter: Counter | undefined) => {
    onChange(counter);
    setEditing(false);
  };

  if (!hasCounter(task)) {
    return editing ? (
      <CounterPicker value={undefined} onChange={change} />
    ) : (
      <Button variant="outline" className="w-fit" onClick={() => setEditing(true)}>
        <PlusIcon data-icon="inline-start" />
        Añadir contador
      </Button>
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-primary/50 bg-primary-soft/60 p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs tracking-widest text-primary-text uppercase">
          Contador · {COUNTER_INFO[task.counter.kind].label}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          Cambiar tipo
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </div>
      {editing ? (
        <CounterPicker value={task.counter} onChange={change} />
      ) : (
        <CounterControl key={`${task.path}:${task.line}`} task={task} />
      )}
    </section>
  );
}

function Properties({ task }: { task: Task }) {
  const project = linkTarget(task.fields.project);
  const dates = [task.scheduled, task.due].filter((date) => date !== undefined);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Propiedades
      </h3>
      <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3 text-sm">
        {task.fields.area && <Property label="Área">{task.fields.area}</Property>}
        {project && <Property label="Proyecto">{project}</Property>}
        {task.fields.habit && <Property label="Hábito">{task.fields.habit}</Property>}
        {dates.length > 0 && (
          <Property
            label={task.scheduled && task.due ? "Empieza · vence" : task.due ? "Vence" : "Cuándo"}
          >
            {dates.map(formatShortDay).join(" → ")}
          </Property>
        )}
        <Property label="Repite">{task.recurrence ?? "No"}</Property>
        {task.tags.length > 0 && (
          <Property label="Etiquetas">
            <span className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </span>
          </Property>
        )}
        <Property label="Nota">{noteName(task.path)}</Property>
      </dl>
    </section>
  );
}

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}
