import { ProjectCard } from "./ProjectCard";
import type { ProjectViewProps } from "./ProjectViewProps";

/** Los proyectos como tarjetas sueltas, una tras otra, sin columnas. */
export function ProjectGallery({ projects, selectedId, onSelect, onOpen }: ProjectViewProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] items-start gap-4">
      {projects.map((summary) => (
        <ProjectCard
          key={summary.id}
          summary={summary}
          selected={summary.id === selectedId}
          onSelect={() => onSelect(summary.id)}
          onOpen={() => onOpen(summary.id)}
        />
      ))}
    </div>
  );
}
