import { weekSessions, type RoadmapSummary } from "@rumbo/core";
import { CalendarClockIcon, GaugeIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useRumbo } from "@/app/RumboContext";
import { cn } from "@/lib/utils";
import { paceLabel } from "./paceLabels";
import { formatSchedule } from "./schedule";

/** Sobre el diagrama: cuándo estudias, qué toca esta semana y si vas al día. */
export function ScheduleStrip({ roadmap }: { roadmap: RoadmapSummary }) {
  const rumbo = useRumbo();
  const week = weekSessions(roadmap.plan.sessions, rumbo.daily.today())[0];
  const module = roadmap.modules.find((candidate) => candidate.path === week?.id);
  const pace = roadmap.status === "active" && roadmap.pace.state !== "no-deadline";
  const label = paceLabel(roadmap);

  if (!roadmap.schedule.length && !module && !pace) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b px-4 py-2 text-xs text-muted-foreground">
      {roadmap.schedule.length > 0 && (
        <Item icon={<CalendarClockIcon className="size-3.5" />}>
          {formatSchedule(roadmap.schedule)}
        </Item>
      )}
      {module && week && (
        <Item>
          Esta semana: <strong className="font-medium text-foreground">{module.title}</strong> ·{" "}
          {week.count} {week.count === 1 ? "sesión" : "sesiones"}
        </Item>
      )}
      {pace && (
        <Item icon={<GaugeIcon className="size-3.5" />} className={label.tone}>
          {label.text}
        </Item>
      )}
    </div>
  );
}

function Item({
  icon,
  className,
  children,
}: {
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("flex items-center gap-1.5 font-mono", className)}>
      {icon}
      <span>{children}</span>
    </span>
  );
}
