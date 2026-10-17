import type { ProjectStatus, ProjectSummary } from "@rumbo/core";
import { CheckIcon, LightbulbIcon, PauseIcon, PlayIcon, type LucideIcon } from "lucide-react";
import { GROUPS } from "./projectLabels";
import { ProjectGroup } from "./ProjectGroup";

const ICONS: Record<ProjectStatus, LucideIcon> = {
  active: PlayIcon,
  idea: LightbulbIcon,
  blocked: PauseIcon,
  done: CheckIcon,
};

const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Los proyectos agrupados por estado; solo «En marcha» sale abierto. */
export function ProjectList({
  projects,
  selectedId,
}: {
  projects: ProjectSummary[];
  selectedId: number | undefined;
}) {
  return (
    <div className="flex flex-col gap-4">
      {GROUPS.map(({ status, many }) => (
        <ProjectGroup
          key={status}
          title={capitalized(many)}
          icon={ICONS[status]}
          projects={projects.filter(({ project }) => project.status === status)}
          selectedId={selectedId}
          defaultOpen={status === "active"}
        />
      ))}
    </div>
  );
}
