import { FlagIcon } from "lucide-react";
import { Link } from "wouter";
import { Tag } from "@/features/roadmaps/Tag";
import { AreaDot } from "@/features/tasks/AreaDot";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { formatDayMonth } from "@/lib/format";
import { inDaysLabel, projectHref } from "./projectLabels";

const SHOWN = 5;

/** Los próximos hitos con fecha de todos los proyectos abiertos; sin ninguno, no sale. */
export function UpcomingMilestones() {
  const upcoming = useVaultQuery((r) => r.projects.upcomingMilestones(SHOWN)).data ?? [];
  if (upcoming.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card">
      <h2 className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border">
          <FlagIcon className="size-4" />
        </span>
        <span className="font-semibold">Próximos hitos</span>
        <span className="text-sm text-muted-foreground">de todos los proyectos</span>
      </h2>
      <ul className="flex flex-col">
        {upcoming.map(({ projectId, project, milestone, daysLeft }) => (
          <li key={`${projectId}:${milestone.title}`}>
            <Link
              href={projectHref(projectId)}
              className="flex h-10 items-center gap-4 rounded-md text-sm outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
            >
              <span className="w-14 shrink-0 font-mono text-muted-foreground">
                {formatDayMonth(milestone.date!)}
              </span>
              {project.area && <AreaDot area={project.area} className="size-2.5 rounded-full" />}
              <span className="truncate font-medium">{milestone.title}</span>
              <span className="truncate text-muted-foreground">{project.title}</span>
              <Tag className="ml-auto text-primary-text">{inDaysLabel(daysLeft)}</Tag>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
