import { resourcesInText, type TaskDraft } from "@rumbo/core";
import type { ReactNode } from "react";
import { PanelSection } from "@/components/panel/PanelSection";
import { TaskNotes } from "./TaskNotes";
import { TaskProperties } from "./TaskProperties";
import { TaskResources } from "./TaskResources";
import { TaskSteps } from "./TaskSteps";
import type { TaskStatus } from "./taskStatus";
import { TaskTitle } from "./TaskTitle";
import { useInheritance } from "./useInheritance";
import type { TaskContext } from "./useTaskContext";
import { useTaskOptions } from "./useTaskOptions";

/** Lo que se ve en el panel, igual al crear y al editar: título, descripción, propiedades, pasos y recursos. */
export function TaskPanelBody({
  draft,
  context,
  status,
  creating,
  banner,
  onPatch,
  onTitleChange,
  onTitleBlur,
}: {
  draft: TaskDraft;
  context: TaskContext;
  status: TaskStatus | undefined;
  creating: boolean;
  /** Algo que va justo bajo el título, como la propuesta de la IA. */
  banner?: ReactNode;
  onPatch: (changes: Partial<TaskDraft>) => void;
  onTitleChange: (title: string) => void;
  onTitleBlur?: () => void;
}) {
  const options = useTaskOptions();
  const inheritance = useInheritance(draft);
  const resources = [...resourcesInText(draft.notes ?? ""), ...context.resources];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
      <TaskTitle
        value={draft.text}
        done={status?.done}
        autoFocus={creating}
        onChange={onTitleChange}
        onBlur={onTitleBlur}
        onToggleDone={(done) => status?.onChange(done)}
      />
      {banner}
      <PanelSection title="Descripción">
        <TaskNotes value={draft.notes ?? ""} onChange={(notes) => onPatch({ notes })} />
      </PanelSection>
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
