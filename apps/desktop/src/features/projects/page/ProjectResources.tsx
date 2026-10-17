import type { ProjectSummary } from "@rumbo/core";
import { LinkIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { LinkRow } from "../links/LinkRow";
import { AddResource } from "./AddResource";
import { SectionCard } from "./SectionCard";

/** El repositorio, la web y las notas del vault del proyecto; cada uno se abre donde toca. */
export function ProjectResources({ summary: { id, project } }: { summary: ProjectSummary }) {
  const { projects } = useRumbo();

  return (
    <SectionCard icon={LinkIcon} title="Notas y recursos">
      {project.links.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Su repositorio, su web y las notas que lo acompañan.
        </p>
      )}
      <div className="flex flex-col gap-1">
        {project.links.map((link, index) => (
          <LinkRow
            key={link.kind === "note" ? link.name : link.url}
            link={link}
            onRemove={() => void projects.removeLink(id, index)}
          />
        ))}
      </div>
      <div className="-mt-1 flex">
        <AddResource id={id} links={project.links} />
      </div>
    </SectionCard>
  );
}
