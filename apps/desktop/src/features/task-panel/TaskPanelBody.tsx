import type { TaskDraft } from "@rumbo/core";
import type { ReactNode } from "react";
import { TaskChips } from "./TaskChips";
import { TaskCounter } from "./TaskCounter";
import { TaskProperties } from "./TaskProperties";
import { TaskResources } from "./TaskResources";
import { TaskSteps } from "./TaskSteps";
import type { TaskStatus } from "./taskStatus";
import { TaskTitle } from "./TaskTitle";
import { useInheritance } from "./useInheritance";
import type { TaskContext } from "./useTaskContext";
import { useTaskOptions } from "./useTaskOptions";

/** Lo que se ve en el panel, igual al crear y al editar: título, contador, propiedades y pasos. */
export function TaskPanelBody({
  draft,
  context,
  status,
  creating,
  live,
  onPatch,
  onTitleChange,
  onTitleBlur,
}: {
  draft: TaskDraft;
  context: TaskContext;
  status: TaskStatus | undefined;
  creating: boolean;
  /** El cronómetro o temporizador en marcha, que ocupa el sitio de la cantidad. */
  live?: ReactNode;
  onPatch: (changes: Partial<TaskDraft>) => void;
  onTitleChange: (title: string) => void;
  onTitleBlur?: () => void;
}) {
  const options = useTaskOptions();
  const inheritance = useInheritance(draft);
  const measured = draft.counter?.kind === "minutes" ? draft.counter.current : 0;
  const realMinutes = measured > 0 ? measured : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
      <div className="flex flex-col gap-3">
        <TaskTitle
          value={draft.text}
          done={status?.done}
          autoFocus={creating}
          onChange={onTitleChange}
          onBlur={onTitleBlur}
          onToggleDone={(done) => status?.onChange(done)}
        />
        <TaskChips draft={draft} status={status} onChange={onPatch} />
      </div>
      <TaskCounter
        counter={draft.counter}
        steps={draft.steps ?? []}
        live={live}
        onChange={(counter) => onPatch({ counter })}
      />
      <TaskProperties
        draft={draft}
        context={context}
        realMinutes={realMinutes}
        inheritance={inheritance}
        options={options}
        onChange={onPatch}
      />
      <TaskSteps steps={draft.steps ?? []} onChange={(steps) => onPatch({ steps })} />
      {context.resources.length > 0 && <TaskResources resources={context.resources} />}
    </div>
  );
}
