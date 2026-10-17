import type { ProjectSummary } from "@rumbo/core";
import { ChartNoAxesColumnIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { percent } from "@/features/goals/goalLabels";
import { Tag } from "@/features/roadmaps/Tag";
import { PACE_LABEL } from "../projectLabels";
import { SectionCard } from "./SectionCard";

/** El avance en un anillo y, al lado, las tareas y los hitos hechos y el ritmo. */
export function ProjectProgress({
  summary: { project, progress, nextTasks, doneTasks, pace },
}: {
  summary: ProjectSummary;
}) {
  const tasks = nextTasks.length + doneTasks.length;
  const milestones = project.milestones.length;
  const chip = pace?.state && PACE_LABEL[pace.state];

  return (
    <SectionCard icon={ChartNoAxesColumnIcon} title="Progreso">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <ProgressRing value={progress} color="var(--primary)" size={100} stroke={9} />
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
            {percent(progress)}
          </span>
        </div>
        <dl className="flex min-w-0 flex-1 flex-col gap-2.5 text-sm">
          <Figure label="Tareas">
            {doneTasks.length} / {tasks}
          </Figure>
          {milestones > 0 && (
            <Figure label="Hitos">
              {project.milestones.filter((milestone) => milestone.done).length} / {milestones}
            </Figure>
          )}
          <Figure label="Ritmo">
            {chip ? (
              <Tag dot className={chip.style}>
                {chip.label}
              </Tag>
            ) : (
              <span className="font-sans text-muted-foreground">Sin medir</span>
            )}
          </Figure>
        </dl>
      </div>
    </SectionCard>
  );
}

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono font-medium">{children}</dd>
    </div>
  );
}
