import type { TaskDraft } from "@rumbo/core";
import {
  BookOpenIcon,
  CalendarCheckIcon,
  CalendarClockIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  ClockIcon,
  FlagIcon,
  FolderKanbanIcon,
  RepeatIcon,
} from "lucide-react";
import { PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { formatMinutes } from "@/lib/format";
import { AreaProperty } from "./AreaProperty";
import { CounterProperty } from "./CounterProperty";
import { DateProperty } from "./DateProperty";
import type { PropertyOption } from "./OptionList";
import { OptionProperty } from "./OptionProperty";
import { TagsProperty } from "./TagsProperty";
import type { Inheritance } from "./useInheritance";
import type { TaskOptions } from "./useTaskOptions";

const DURATIONS = [15, 30, 45, 60, 90, 120];

const REPEATS: PropertyOption[] = [
  { value: "every day", label: "Cada día" },
  { value: "every week", label: "Cada semana" },
  { value: "every month", label: "Cada mes" },
];

const PRIORITIES: PropertyOption[] = (["high", "medium", "low"] as const).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));

const STATUSES: PropertyOption[] = [
  { value: "pending", label: "Pendiente" },
  { value: "done", label: "Hecha" },
];

export interface TaskStatus {
  done: boolean;
  onChange: (done: boolean) => void;
}

/** Las propiedades de la tarea, una fila cada una. «Estado» solo existe en una tarea que ya existe. */
export function TaskProperties({
  draft,
  status,
  inheritance,
  options,
  onChange,
}: {
  draft: TaskDraft;
  status: TaskStatus | undefined;
  inheritance: Inheritance | undefined;
  options: TaskOptions;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <div className="flex flex-col">
      {status && (
        <OptionProperty
          icon={status.done ? <CircleCheckIcon /> : <CircleDashedIcon />}
          label="Estado"
          value={status.done ? "done" : "pending"}
          options={STATUSES}
          onChange={(value) => status.onChange(value === "done")}
        />
      )}
      <DateProperty
        icon={<CalendarCheckIcon />}
        label="Cuándo"
        value={draft.scheduled}
        onChange={(scheduled) => onChange({ scheduled })}
      />
      <DateProperty
        icon={<CalendarClockIcon />}
        label="Fecha límite"
        value={draft.due}
        onChange={(due) => onChange({ due })}
      />
      <OptionProperty
        icon={<ClockIcon />}
        label="Duración"
        clearLabel="Sin duración"
        value={draft.duration?.toString()}
        options={durationOptions(draft.duration)}
        onChange={(value) => onChange({ duration: value ? Number(value) : undefined })}
      />
      <OptionProperty
        icon={<FlagIcon />}
        label="Prioridad"
        clearLabel="Sin prioridad"
        value={draft.priority}
        options={PRIORITIES}
        onChange={(priority) => onChange({ priority: priority as TaskDraft["priority"] })}
      />
      <OptionProperty
        icon={<RepeatIcon />}
        label="Repetir"
        clearLabel="No se repite"
        value={draft.recurrence}
        options={REPEATS}
        onChange={(recurrence) => onChange({ recurrence })}
      />
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
          icon={<FolderKanbanIcon />}
          label="Proyecto"
          clearLabel="Sin proyecto"
          value={draft.project}
          options={options.projects}
          onChange={(project) => onChange({ project })}
        />
      )}
      {options.modules.length > 0 && (
        <OptionProperty
          icon={<BookOpenIcon />}
          label="Roadmap / Módulo"
          clearLabel="Sin módulo"
          value={draft.module}
          options={options.modules}
          onChange={(module) => onChange({ module })}
        />
      )}
      <TagsProperty
        tags={draft.tags ?? []}
        known={options.tags}
        onChange={(tags) => onChange({ tags })}
      />
      <CounterProperty value={draft.counter} onChange={(counter) => onChange({ counter })} />
    </div>
  );
}

function durationOptions(current: number | undefined): PropertyOption[] {
  const minutes =
    current && !DURATIONS.includes(current)
      ? [...DURATIONS, current].sort((a, b) => a - b)
      : DURATIONS;
  return minutes.map((value) => ({ value: String(value), label: formatMinutes(value) }));
}
