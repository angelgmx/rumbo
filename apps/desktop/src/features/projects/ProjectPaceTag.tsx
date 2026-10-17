import type { ProjectSummary } from "@rumbo/core";
import { GoalPaceTag } from "@/features/goals/GoalPaceTag";

/** «Al día», «Por detrás», «En riesgo»; un proyecto sin pasos que medir está «Sin plan». */
export function ProjectPaceTag({ summary }: { summary: ProjectSummary }) {
  const { progress, steps, pace, project } = summary;
  if (project.status === "done") return null;
  return <GoalPaceTag summary={{ progress: steps.total > 0 ? progress : undefined, pace }} />;
}
