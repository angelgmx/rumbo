import type { TaskDraft } from "@rumbo/core";
import { Separator } from "@/components/ui/separator";
import { TaskNotes } from "./TaskNotes";
import { TaskProperties, type TaskStatus } from "./TaskProperties";
import { TaskSteps } from "./TaskSteps";
import { TaskTitle } from "./TaskTitle";
import { useInheritance } from "./useInheritance";
import { useTaskOptions } from "./useTaskOptions";

/** Lo que se ve en el panel, igual al crear y al editar: título, propiedades, notas y pasos. */
export function TaskPanelBody({
  draft,
  status,
  creating,
  onPatch,
  onTitleChange,
  onTitleBlur,
}: {
  draft: TaskDraft;
  status: TaskStatus | undefined;
  creating: boolean;
  onPatch: (changes: Partial<TaskDraft>) => void;
  onTitleChange: (title: string) => void;
  onTitleBlur?: () => void;
}) {
  const options = useTaskOptions();
  const inheritance = useInheritance(draft);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
      <TaskTitle
        value={draft.text}
        done={status?.done}
        autoFocus={creating}
        onChange={onTitleChange}
        onBlur={onTitleBlur}
        onToggleDone={(done) => status?.onChange(done)}
      />
      <TaskProperties
        draft={draft}
        status={status}
        inheritance={inheritance}
        options={options}
        onChange={onPatch}
      />
      <Separator />
      <TaskNotes value={draft.notes ?? ""} onChange={(notes) => onPatch({ notes })} />
      <TaskSteps steps={draft.steps ?? []} onChange={(steps) => onPatch({ steps })} />
    </div>
  );
}
