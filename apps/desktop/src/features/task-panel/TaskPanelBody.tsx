import { resourcesInText, type TaskDraft } from "@rumbo/core";
import { TaskChips } from "./TaskChips";
import { TaskNotes } from "./TaskNotes";
import { TaskProperties } from "./TaskProperties";
import { TaskResources } from "./TaskResources";
import { TaskSteps } from "./TaskSteps";
import type { TaskStatus } from "./taskStatus";
import { TaskTitle } from "./TaskTitle";
import { useInheritance } from "./useInheritance";
import type { TaskContext } from "./useTaskContext";
import { useTaskOptions } from "./useTaskOptions";

/** Lo que se ve en el panel, igual al crear y al editar: título, notas, propiedades, pasos y recursos. */
export function TaskPanelBody({
  draft,
  context,
  status,
  creating,
  onPatch,
  onTitleChange,
  onTitleBlur,
}: {
  draft: TaskDraft;
  context: TaskContext;
  status: TaskStatus | undefined;
  creating: boolean;
  onPatch: (changes: Partial<TaskDraft>) => void;
  onTitleChange: (title: string) => void;
  onTitleBlur?: () => void;
}) {
  const options = useTaskOptions();
  const inheritance = useInheritance(draft);
  const resources = [...resourcesInText(draft.notes ?? ""), ...context.resources];

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
        <TaskNotes value={draft.notes ?? ""} onChange={(notes) => onPatch({ notes })} />
        <TaskChips draft={draft} status={status} onChange={onPatch} />
      </div>
      <TaskProperties
        draft={draft}
        context={context}
        inheritance={inheritance}
        options={options}
        onChange={onPatch}
      />
      <TaskSteps steps={draft.steps ?? []} onChange={(steps) => onPatch({ steps })} />
      {resources.length > 0 && <TaskResources resources={resources} />}
    </div>
  );
}
