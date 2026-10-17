import type { ProjectSummary } from "@rumbo/core";
import { Tag } from "@/features/roadmaps/Tag";
import { PACE_LABEL } from "./projectLabels";

/** Solo avisa cuando el proyecto va «Por detrás» o «Va tarde»; al día, no dice nada. */
export function ProjectRiskTag({ summary: { pace, project } }: { summary: ProjectSummary }) {
  if (project.status === "done" || (pace?.state !== "behind" && pace?.state !== "at-risk")) {
    return null;
  }
  const { label, style } = PACE_LABEL[pace.state];
  return (
    <Tag dot className={style}>
      {label}
    </Tag>
  );
}
