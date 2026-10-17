import type { CalendarDay, Deadline } from "@rumbo/core";
import { FlagIcon, FolderKanbanIcon, TargetIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useRumbo } from "@/app/RumboContext";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useArea } from "@/hooks/useArea";
import { tint } from "../events/tint";
import { ColorCheck } from "../ColorCheck";

const DEADLINE_ICON: Record<Deadline["kind"], LucideIcon> = {
  goal: TargetIcon,
  project: FolderKanbanIcon,
  milestone: FlagIcon,
};

/** La franja «todo el día»: fechas límite de objetivos, proyectos e hitos y tareas sin hora. */
export function AllDayRow({ days }: { days: CalendarDay[] }) {
  return (
    <>
      {days.map(({ date, deadlines, untimed }) => (
        <div key={date} className="flex min-h-9 flex-col gap-0.5 border-l px-1 py-1">
          {deadlines.map((deadline) => (
            <DeadlineChip key={`${deadline.kind}-${deadline.title}`} deadline={deadline} />
          ))}
          {untimed.map((task) => (
            <UntimedTask key={task.id} task={task} />
          ))}
        </div>
      ))}
    </>
  );
}

function DeadlineChip({ deadline }: { deadline: Deadline }) {
  const { color } = useArea(deadline.area);
  const Icon = DEADLINE_ICON[deadline.kind];
  const title = deadline.kind === "milestone" ? `Hito: ${deadline.title}` : deadline.title;

  return (
    <Chip color={color}>
      <Icon className="size-3.5 shrink-0" style={{ color }} />
      <span className="truncate">{title}</span>
    </Chip>
  );
}

function UntimedTask({ task }: { task: CalendarDay["untimed"][number] }) {
  const rumbo = useRumbo();
  const taskPanel = useTaskPanel();
  const { color } = useArea(task.area);

  return (
    <Chip color={color}>
      <ColorCheck
        checked={task.done}
        color={color}
        label={task.text}
        className="size-3.5"
        onToggle={() => void rumbo.tasks.setDone(task, !task.done)}
      />
      <button type="button" className="truncate" onClick={() => taskPanel.edit(task)}>
        {task.text}
      </button>
    </Chip>
  );
}

function Chip({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      className="flex h-[22px] items-center gap-1.5 rounded-[5px] border-l-[3px] px-1.5 text-[13px]"
      style={{ backgroundColor: tint(color, 16), borderColor: color }}
    >
      {children}
    </div>
  );
}
