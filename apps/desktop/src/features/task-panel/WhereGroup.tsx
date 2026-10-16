import type { TaskDraft } from "@rumbo/core";
import { BookOpenIcon, MapPinIcon } from "lucide-react";
import { PanelSection } from "@/components/panel/PanelSection";
import { AreaProperty } from "./AreaProperty";
import { GoalProperty } from "./GoalProperty";
import { OptionProperty } from "./OptionProperty";
import { TagsProperty } from "./TagsProperty";
import type { Inheritance } from "./useInheritance";
import type { TaskContext } from "./useTaskContext";
import type { TaskOptions } from "./useTaskOptions";

/** Dónde encaja la tarea: su área, proyecto, módulo, objetivo y etiquetas. */
export function WhereGroup({
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
    <PanelSection title="Dónde" icon={MapPinIcon}>
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
          empty="Elegir proyecto"
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
          empty="Elegir módulo"
          value={draft.module}
          options={options.modules}
          onChange={(module) => onChange({ module })}
        />
      )}
      {(options.goals.length > 0 || context.goal) && (
        <GoalProperty
          goalId={draft.goalId}
          inherited={draft.goalId === undefined ? context.goal : undefined}
          options={options.goals}
          onChange={(goalId) => onChange({ goalId })}
        />
      )}
      <TagsProperty
        tags={draft.tags ?? []}
        known={options.tags}
        onChange={(tags) => onChange({ tags })}
      />
    </PanelSection>
  );
}
