import type { TaskDraft } from "@rumbo/core";
import { PanelSection } from "@/components/panel/PanelSection";
import { EffortGroup } from "./EffortGroup";
import { WhenGroup } from "./WhenGroup";
import { WhereGroup } from "./WhereGroup";
import type { Inheritance } from "./useInheritance";
import type { TaskContext } from "./useTaskContext";
import type { TaskOptions } from "./useTaskOptions";

/** Las propiedades de la tarea, en tres grupos: cuándo, dónde y esfuerzo. */
export function TaskProperties({
  draft,
  context,
  inheritance,
  options,
  onChange,
}: {
  draft: TaskDraft;
  context: TaskContext;
  inheritance: Inheritance | undefined;
  options: TaskOptions;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <PanelSection title="Propiedades">
      <div className="flex flex-col gap-4">
        <WhenGroup draft={draft} onChange={onChange} />
        <WhereGroup
          draft={draft}
          context={context}
          inheritance={inheritance}
          options={options}
          onChange={onChange}
        />
        <EffortGroup draft={draft} onChange={onChange} />
      </div>
    </PanelSection>
  );
}
