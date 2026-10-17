import type { ProjectSummary } from "@rumbo/core";
import { PencilIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { InlineTitle } from "@/components/InlineTitle";
import { GoalProgressBar } from "@/features/goals/GoalProgressBar";
import { ProjectPaceTag } from "../ProjectPaceTag";
import { ProjectTile } from "../ProjectTile";

/** El icono de su área, el título que se edita en su sitio, cómo va y el avance. */
export function ProjectTitle({ summary }: { summary: ProjectSummary }) {
  const rumbo = useRumbo();
  const { id, project, progress } = summary;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <ProjectTile area={project.area} className="size-10 rounded-xl [&_svg]:size-5" />
        <InlineTitle
          label="Título del proyecto"
          value={project.title}
          onSave={(title) => void rumbo.projects.update(id, { title })}
          className="min-w-0 px-1 py-0.5 text-2xl font-semibold tracking-tight"
        />
        <PencilIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3">
        <ProjectPaceTag summary={summary} />
        <div className="w-56">
          <GoalProgressBar progress={progress} />
        </div>
      </div>
    </div>
  );
}
