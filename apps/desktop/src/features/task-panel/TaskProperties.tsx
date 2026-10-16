import type { TaskDraft } from "@rumbo/core";
import { EffortGroup } from "./EffortGroup";
import { WhenGroup } from "./WhenGroup";
import { WhereGroup } from "./WhereGroup";
import type { Inheritance } from "./useInheritance";
import type { TaskContext } from "./useTaskContext";
import type { TaskOptions } from "./useTaskOptions";

/** Las propiedades de la tarea, en tres secciones: cuándo, dónde y esfuerzo. */
export function TaskProperties({
  draft,
  taskId,
  context,
  inheritance,
  options,
  onChange,
}: {
  draft: TaskDraft;
  taskId: number | undefined;
  context: TaskContext;
  inheritance: Inheritance | undefined;
  options: TaskOptions;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <>
      <WhenGroup draft={draft} onChange={onChange} />
      <WhereGroup
        draft={draft}
        context={context}
        inheritance={inheritance}
        options={options}
        onChange={onChange}
      />
      <EffortGroup draft={draft} taskId={taskId} onChange={onChange} />
    </>
  );
}
