import type { ProjectSummary } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { StatusBoard } from "@/components/StatusBoard";
import { ProjectCard } from "./ProjectCard";
import { STATUS_LABEL, STATUS_ORDER, STATUS_STYLE } from "./projectLabels";

/** Un proyecto por tarjeta, en la columna de su estado; arrastrarla a otra columna lo cambia. */
export function ProjectBoard({ projects }: { projects: ProjectSummary[] }) {
  const rumbo = useRumbo();

  return (
    <StatusBoard
      items={projects}
      statusOf={({ project }) => project.status}
      statuses={STATUS_ORDER}
      label={STATUS_LABEL}
      dotStyle={STATUS_STYLE}
      onMove={({ id }, status) => void rumbo.projects.setStatus(id, status)}
      renderCard={(summary, className) => <ProjectCard summary={summary} className={className} />}
    />
  );
}
