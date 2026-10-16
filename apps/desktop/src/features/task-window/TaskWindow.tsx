import type { Task } from "@rumbo/core";
import { useState, type KeyboardEvent } from "react";
import { useRumbo } from "@/app/RumboContext";
import { DialogContent } from "@/components/ui/dialog";
import { CounterPicker } from "@/features/counters/CounterPicker";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { InheritanceLine } from "./InheritanceLine";
import { PropertyChips } from "./PropertyChips";
import { TaskBreadcrumb } from "./TaskBreadcrumb";
import { TaskSteps } from "./TaskSteps";
import { TaskTitleFields } from "./TaskTitleFields";
import { TaskWindowFooter } from "./TaskWindowFooter";
import { useTaskForm } from "./useTaskForm";
import { useTaskOptions } from "./useTaskOptions";

/**
 * La ventana donde se crea, se ve y se edita una tarea.
 * Con `task` edita esa; sin ella, crea una nueva y, con «Crear otra», sigue con otra en blanco.
 */
export function TaskWindow({ task, onClose }: { task: Task | undefined; onClose: () => void }) {
  const [round, setRound] = useState(0);
  const [another, setAnother] = useState(false);

  return (
    <DialogContent className="flex max-h-[calc(100vh-4rem)] flex-col gap-0 p-0 sm:max-w-3xl">
      <TaskForm
        key={round}
        task={task}
        another={another}
        onAnotherChange={setAnother}
        onSaved={() => (another ? setRound(round + 1) : onClose())}
      />
    </DialogContent>
  );
}

function TaskForm({
  task,
  another,
  onAnotherChange,
  onSaved,
}: {
  task: Task | undefined;
  another: boolean;
  onAnotherChange: (another: boolean) => void;
  onSaved: () => void;
}) {
  const rumbo = useRumbo();
  const form = useTaskForm(task, onSaved);
  const options = useTaskOptions();
  const live = useLiveTask(task);
  const { draft, inheritance } = form;

  // Ctrl Enter guarda desde cualquier campo, también desde los pasos y las fichas.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && form.canSave) {
      event.preventDefault();
      void form.save();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      <header className="px-6 pt-5 pr-14 pb-4">
        <TaskBreadcrumb
          module={options.modules.find((module) => module.value === draft.module)}
          editing={task !== undefined}
        />
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
        <TaskTitleFields
          title={draft.text}
          notes={draft.notes ?? ""}
          task={live}
          onTitleChange={form.typeTitle}
          onTitleBlur={form.finishTitle}
          onNotesChange={(notes) => form.patch({ notes })}
          onToggleDone={(done) => live && rumbo.tasks.setDone(live, done)}
        />
        <PropertyChips
          draft={draft}
          area={draft.area ?? inheritance?.area}
          options={options}
          onChange={form.patch}
        />
        {inheritance && <InheritanceLine {...inheritance} />}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Contador</h3>
          <CounterPicker value={draft.counter} onChange={(counter) => form.patch({ counter })} />
        </section>
        <TaskSteps steps={draft.steps ?? []} onChange={(steps) => form.patch({ steps })} />
      </div>
      <TaskWindowFooter
        editing={task !== undefined}
        another={another}
        canSave={form.canSave}
        onAnotherChange={onAnotherChange}
        onSave={() => void form.save()}
      />
    </div>
  );
}

/** La tarea como está ahora en el vault: si la marcas hecha, la casilla lo enseña. */
function useLiveTask(task: Task | undefined): Task | undefined {
  const all = useVaultQuery((rumbo) => rumbo.tasks.all()).data ?? [];
  return (
    task && (all.find((other) => other.path === task.path && other.line === task.line) ?? task)
  );
}
