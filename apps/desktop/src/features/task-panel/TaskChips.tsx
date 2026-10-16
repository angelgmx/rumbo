import type { Priority, TaskDraft } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { DateRangePicker } from "@/components/DateRangePicker";
import { PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { formatRelativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { PRIORITIES, STATUSES } from "./taskChoices";
import type { TaskStatus } from "./taskStatus";

const CHIP = "h-6 rounded-md border px-2 text-xs font-medium";

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "border-destructive/40 bg-destructive/10 text-destructive",
  medium: "border-warning/40 bg-warning/10 text-warning",
  low: "border-border text-muted-foreground",
};

/** Las tres fichas de bajo el título: estado (solo si la tarea ya existe), prioridad y fecha. */
export function TaskChips({
  draft,
  status,
  onChange,
}: {
  draft: TaskDraft;
  status: TaskStatus | undefined;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {status && <StatusChip status={status} />}
      <PriorityChip value={draft.priority} onChange={(priority) => onChange({ priority })} />
      <DateChip draft={draft} onChange={onChange} />
    </div>
  );
}

function StatusChip({ status }: { status: TaskStatus }) {
  return (
    <PropertyPopover
      label="Estado"
      width="w-44"
      className={cn(CHIP, status.done ? "border-success/40 text-success" : "text-muted-foreground")}
      trigger={status.done ? "Hecha" : "Pendiente"}
    >
      {(close) => (
        <OptionList
          options={STATUSES}
          value={status.done ? "done" : "pending"}
          onChoose={(value) => {
            status.onChange(value === "done");
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}

function PriorityChip({
  value,
  onChange,
}: {
  value: Priority | undefined;
  onChange: (priority: Priority | undefined) => void;
}) {
  return (
    <PropertyPopover
      label="Prioridad"
      width="w-44"
      className={cn(CHIP, value ? PRIORITY_STYLE[value] : "border-dashed text-muted-foreground")}
      trigger={value ? PRIORITY_LABEL[value] : "Sin prioridad"}
    >
      {(close) => (
        <OptionList
          options={PRIORITIES}
          value={value}
          clearLabel="Sin prioridad"
          onChoose={(priority) => {
            onChange(priority as Priority | undefined);
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}

// La ficha enseña cuándo se hace la tarea; si solo tiene fecha límite, enseña esa.
function DateChip({
  draft,
  onChange,
}: {
  draft: TaskDraft;
  onChange: (changes: Partial<TaskDraft>) => void;
}) {
  const today = useRumbo().daily.today();
  const field = draft.scheduled || !draft.due ? "scheduled" : "due";
  const date = draft[field];

  return (
    <PropertyPopover
      label="Fecha"
      width="w-auto p-1"
      className={cn(CHIP, !date && "border-dashed text-muted-foreground")}
      trigger={
        date ? `${field === "due" ? "Vence " : ""}${formatRelativeDay(date, today)}` : "Sin fecha"
      }
    >
      {(close) => (
        <DateRangePicker
          value={{ start: draft.scheduled, end: draft.due }}
          onChange={({ start, end }) => onChange({ scheduled: start, due: end })}
          onDone={close}
        />
      )}
    </PropertyPopover>
  );
}
