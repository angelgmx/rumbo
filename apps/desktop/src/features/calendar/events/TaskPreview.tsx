import type { Task } from "@rumbo/core";
import { ClockIcon, FlagIcon, FolderKanbanIcon, ListChecksIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { TaskLinkButton } from "@/features/tasks/TaskLinkButton";
import { FLAG_COLOR, PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { useTaskLink } from "@/features/tasks/useTaskLink";
import { useArea } from "@/hooks/useArea";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Lo que enseña la tarjeta al pasar el ratón: título, de dónde viene, cuánto dura y cómo va. */
export function TaskPreview({ task, start, end }: { task: Task; start: string; end?: string }) {
  const { projects } = useRumbo();
  const area = useArea(task.area);
  const link = useTaskLink(task);
  const project = task.projectId === undefined ? undefined : projects.get(task.projectId);
  const stepsDone = task.steps.filter((step) => step.done).length;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[14.5px] leading-5 font-semibold">{task.text}</p>
      <ul className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
        {task.area && (
          <Row
            icon={
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: area.color }} />
            }
          >
            {area.name}
          </Row>
        )}
        {project && (
          <Row icon={<FolderKanbanIcon className="size-3.5" />}>{project.project.title}</Row>
        )}
        {link && (
          <li className="flex items-center gap-2 text-foreground">
            <TaskLinkButton link={link} className="text-[13px]" />
          </li>
        )}
        <Row icon={<ClockIcon className="size-3.5" />}>
          <span className="font-mono">
            {start}
            {end && ` – ${end}`}
          </span>
          {task.duration !== undefined && ` · ${formatMinutes(task.duration)}`}
        </Row>
        {task.steps.length > 0 && (
          <Row icon={<ListChecksIcon className="size-3.5" />}>
            <span className="font-mono">
              {stepsDone}/{task.steps.length}
            </span>{" "}
            pasos
          </Row>
        )}
        {task.priority && (
          <Row
            icon={<FlagIcon className={cn("size-3.5 fill-current", FLAG_COLOR[task.priority])} />}
          >
            Prioridad {PRIORITY_LABEL[task.priority].toLowerCase()}
          </Row>
        )}
      </ul>
    </div>
  );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="flex size-3.5 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 truncate">{children}</span>
    </li>
  );
}
