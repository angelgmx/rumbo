import type { ProjectSummary } from "@rumbo/core";
import { PencilIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { InlineTitle } from "@/components/InlineTitle";
import { ProjectPaceLine } from "../ProjectPaceLine";
import { ProjectStatusPicker } from "../ProjectStatusPicker";
import { ProjectTile } from "../ProjectTile";
import { ProjectCountdown } from "./ProjectCountdown";

/** El icono de su área, el nombre que se edita en su sitio, su estado y cómo va, y la cuenta atrás. */
export function ProjectHeading({ summary }: { summary: ProjectSummary }) {
  const { projects } = useRumbo();
  const { id, project } = summary;

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 items-center gap-4">
        <ProjectTile area={project.area} className="size-14 rounded-2xl [&_svg]:size-6" />
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2">
            <InlineTitle
              label="Nombre del proyecto"
              value={project.title}
              onSave={(title) => void projects.update(id, { title })}
              className="min-w-0 px-1 py-0.5 text-3xl font-semibold tracking-tight"
            />
            <PencilIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <ProjectStatusPicker id={id} status={project.status} />
            <ProjectPaceLine summary={summary} />
          </div>
        </div>
      </div>
      <ProjectCountdown summary={summary} />
    </div>
  );
}
