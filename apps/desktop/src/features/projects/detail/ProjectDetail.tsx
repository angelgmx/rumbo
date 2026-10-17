import type { ProjectSummary } from "@rumbo/core";
import { ProjectDetailHeader } from "./ProjectDetailHeader";
import { ProjectFooter } from "./ProjectFooter";
import { ProjectMilestones } from "./ProjectMilestones";
import { ProjectOutcome } from "./ProjectOutcome";
import { ProjectProperties } from "./ProjectProperties";
import { ProjectTasks } from "./ProjectTasks";
import { ProjectTitle } from "./ProjectTitle";

/** El proyecto abierto: cada cambio se guarda al momento, sin botón. */
export function ProjectDetail({
  summary,
  onClose,
}: {
  summary: ProjectSummary;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectDetailHeader summary={summary} onClose={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-8">
        <ProjectTitle summary={summary} />
        <ProjectProperties summary={summary} />
        <ProjectOutcome summary={summary} />
        <ProjectMilestones summary={summary} />
        <ProjectTasks summary={summary} />
      </div>
      <ProjectFooter summary={summary} />
    </div>
  );
}
