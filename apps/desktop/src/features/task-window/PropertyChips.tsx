import type { TaskDraft } from "@rumbo/core";
import {
  BookOpenIcon,
  ClockIcon,
  FlagIcon,
  FolderKanbanIcon,
  LayersIcon,
  RepeatIcon,
} from "lucide-react";
import { AreaDot } from "@/features/tasks/AreaDot";
import { PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { formatMinutes } from "@/lib/format";
import { OptionChip, type ChipOption } from "./OptionChip";
import { TagsChip } from "./TagsChip";
import type { TaskOptions } from "./useTaskOptions";
import { WhenChip } from "./WhenChip";

const DURATIONS = [15, 30, 45, 60, 90, 120];

const REPEATS: ChipOption[] = [
  { value: "every day", label: "Cada día" },
  { value: "every week", label: "Cada semana" },
  { value: "every month", label: "Cada mes" },
];

const PRIORITIES: ChipOption[] = (["high", "medium", "low"] as const).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));

/** Las fichas de la tarea: cuándo, módulo, duración, prioridad, repetición, proyecto, área y etiquetas. */
export function PropertyChips({
  draft,
  area,
  options,
  onChange,
}: {
  draft: TaskDraft;
  /** El área que se enseña: la de la tarea o la que hereda. */
  area: string | undefined;
  options: TaskOptions;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <WhenChip scheduled={draft.scheduled} due={draft.due} onChange={onChange} />
      {options.modules.length > 0 && (
        <OptionChip
          icon={<BookOpenIcon />}
          placeholder="Módulo"
          clearLabel="Sin módulo"
          value={draft.module}
          options={options.modules}
          onChange={(module) => onChange({ module })}
        />
      )}
      <OptionChip
        icon={<ClockIcon />}
        placeholder="Duración"
        clearLabel="Sin duración"
        value={draft.duration?.toString()}
        options={durationOptions(draft.duration)}
        onChange={(value) => onChange({ duration: value ? Number(value) : undefined })}
      />
      <OptionChip
        icon={<FlagIcon />}
        placeholder="Prioridad"
        clearLabel="Sin prioridad"
        value={draft.priority}
        options={PRIORITIES}
        onChange={(priority) => onChange({ priority: priority as TaskDraft["priority"] })}
      />
      <OptionChip
        icon={<RepeatIcon />}
        placeholder="No se repite"
        clearLabel="No se repite"
        value={draft.recurrence}
        options={REPEATS}
        onChange={(recurrence) => onChange({ recurrence })}
      />
      {options.projects.length > 0 && (
        <OptionChip
          icon={<FolderKanbanIcon />}
          placeholder="Proyecto"
          clearLabel="Sin proyecto"
          value={draft.project}
          options={options.projects}
          onChange={(project) => onChange({ project })}
        />
      )}
      {options.areas.length > 0 && (
        <OptionChip
          icon={area ? <AreaDot area={area} className="size-3.5" /> : <LayersIcon />}
          placeholder="Área"
          clearLabel="Sin área"
          value={area}
          options={options.areas}
          onChange={(next) => onChange({ area: next })}
        />
      )}
      <TagsChip
        tags={draft.tags ?? []}
        known={options.tags}
        onChange={(tags) => onChange({ tags })}
      />
    </div>
  );
}

function durationOptions(current: number | undefined): ChipOption[] {
  const minutes =
    current && !DURATIONS.includes(current)
      ? [...DURATIONS, current].sort((a, b) => a - b)
      : DURATIONS;
  return minutes.map((value) => ({ value: String(value), label: formatMinutes(value) }));
}
