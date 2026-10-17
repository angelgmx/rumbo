import type { ProjectSummary } from "@rumbo/core";
import { percent } from "@/features/goals/goalLabels";
import { PACE_LABEL } from "./projectLabels";

/** «Al día · 43 % hecho»: cómo va el proyecto y cuánto lleva. */
export function ProjectPaceLine({ summary: { pace, progress } }: { summary: ProjectSummary }) {
  const reading = pace?.state && PACE_LABEL[pace.state].label;
  return (
    <span className="text-sm text-muted-foreground">
      {[reading, `${percent(progress)} hecho`].filter(Boolean).join(" · ")}
    </span>
  );
}
