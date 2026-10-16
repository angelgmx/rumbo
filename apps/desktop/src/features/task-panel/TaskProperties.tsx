import type { TaskDraft } from "@rumbo/core";
import { BookOpenIcon } from "lucide-react";
import { AreaProperty } from "./AreaProperty";
import { DatesProperty } from "./DatesProperty";
import { EstimateProperty } from "./EstimateProperty";
import { GoalProperty } from "./GoalProperty";
import { OptionProperty } from "./OptionProperty";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { REPEATS } from "./taskChoices";
import { TagsProperty } from "./TagsProperty";
import type { Inheritance } from "./useInheritance";
import type { TaskContext } from "./useTaskContext";
import type { TaskOptions } from "./useTaskOptions";

/** Las propiedades de la tarea, una fila cada una. */
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
    <section className="flex flex-col">
      <div className="mb-1">
        <SectionLabel>Propiedades</SectionLabel>
      </div>
      {options.areas.length > 0 && (
        <AreaProperty
          value={draft.area}
          inherited={inheritance}
          options={options.areas}
          onChange={(area) => onChange({ area })}
        />
      )}
      {options.projects.length > 0 && (
        <OptionProperty
          label="Proyecto"
          clearLabel="Sin proyecto"
          value={draft.projectId?.toString()}
          options={options.projects}
          onChange={(project) => onChange({ projectId: project ? Number(project) : undefined })}
        />
      )}
      {options.modules.length > 0 && (
        <OptionProperty
          icon={<BookOpenIcon className="size-4 text-muted-foreground" />}
          label="Módulo"
          clearLabel="Sin módulo"
          value={draft.module}
          options={options.modules}
          onChange={(module) => onChange({ module })}
        />
      )}
      {context.goal && <GoalProperty goal={context.goal} />}
      <DatesProperty
        scheduled={draft.scheduled}
        due={draft.due}
        time={draft.time}
        onChange={onChange}
      />
      <OptionProperty
        label="Repite"
        clearLabel="No se repite"
        empty="No"
        value={draft.recurrence}
        options={REPEATS}
        onChange={(recurrence) => onChange({ recurrence })}
      />
      <TagsProperty
        tags={draft.tags ?? []}
        known={options.tags}
        onChange={(tags) => onChange({ tags })}
      />
      <EstimateProperty
        estimated={draft.duration}
        real={draft.spent}
        onChange={(duration) => onChange({ duration })}
      />
    </section>
  );
}
