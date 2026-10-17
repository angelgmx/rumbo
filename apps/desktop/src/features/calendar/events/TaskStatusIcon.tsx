import { CircleCheckIcon, CircleDotIcon, CircleIcon } from "lucide-react";
import type { TaskState } from "@/features/tasks/taskState";
import { cn } from "@/lib/utils";

const LABEL: Record<TaskState, string> = {
  todo: "Pendiente",
  doing: "En curso",
  done: "Hecha",
};

/** El estado de una tarea como icono en el color de su área: pendiente, en curso o hecha. Pulsarlo la marca. */
export function TaskStatusIcon({
  state,
  color,
  label,
  onToggle,
}: {
  state: TaskState;
  color: string;
  label: string;
  onToggle: () => void;
}) {
  const Icon = { todo: CircleIcon, doing: CircleDotIcon, done: CircleCheckIcon }[state];

  return (
    <button
      type="button"
      aria-pressed={state === "done"}
      aria-label={`${label}: ${LABEL[state].toLowerCase()}`}
      title={LABEL[state]}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onToggle}
      className="flex size-[18px] shrink-0 items-center justify-center rounded-full transition-transform duration-(--dur-fast) hover:scale-110 active:scale-95"
      style={{ color }}
    >
      <Icon
        className={cn("size-[18px]", state === "done" && "fill-current/20")}
        strokeWidth={state === "todo" ? 1.75 : 2}
      />
    </button>
  );
}
