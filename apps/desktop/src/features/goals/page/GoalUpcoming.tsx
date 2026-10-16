import type { GoalSummary } from "@rumbo/core";
import { BookOpenIcon, FlagIcon, ListChecksIcon, type LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { formatDayMonth } from "@/lib/format";
import { AsideCard } from "./AsideCard";
import { useRoadmapHref } from "./plan/useRoadmapHref";

/** Lo próximo: la siguiente tarea, el módulo que toca y el hito más cercano. Sin nada de eso, no sale. */
export function GoalUpcoming({
  summary: { tasks, roadmaps, milestone },
}: {
  summary: GoalSummary;
}) {
  const panel = useTaskPanel();
  const hrefOf = useRoadmapHref();
  const task = tasks[0];
  const roadmap = roadmaps.find(({ current }) => current);
  const module = roadmap?.current;
  const taskDate = task?.scheduled ?? task?.due;
  if (!task && !module && !milestone) return null;

  return (
    <AsideCard title="Lo próximo">
      <ul className="flex flex-col gap-3">
        {task && (
          <Item
            icon={ListChecksIcon}
            label="Tarea"
            title={task.text}
            detail={taskDate && formatDayMonth(taskDate)}
            onOpen={() => panel.edit(task)}
          />
        )}
        {roadmap && module && (
          <Item
            icon={BookOpenIcon}
            label="Módulo"
            title={module.title}
            detail={roadmap.title}
            href={hrefOf(roadmap.name, module.name)}
          />
        )}
        {milestone && (
          <Item
            icon={FlagIcon}
            label="Hito"
            title={milestone.title}
            detail={`${milestone.project} · ${formatDayMonth(milestone.date)}`}
          />
        )}
      </ul>
    </AsideCard>
  );
}

function Item({
  icon: Icon,
  label,
  title,
  detail,
  href,
  onOpen,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  detail?: string;
  href?: string;
  onOpen?: () => void;
}) {
  const content = (
    <>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm">{title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {label}
          {detail && ` · ${detail}`}
        </span>
      </span>
    </>
  );
  const className = "flex items-start gap-2.5 text-left";

  if (href) {
    return (
      <li>
        <Link href={href} className={className}>
          {content}
        </Link>
      </li>
    );
  }
  if (onOpen) {
    return (
      <li>
        <button type="button" onClick={onOpen} className={className}>
          {content}
        </button>
      </li>
    );
  }
  return (
    <li>
      <div className={className}>{content}</div>
    </li>
  );
}
