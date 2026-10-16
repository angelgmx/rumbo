import type { Resource } from "@rumbo/core";
import { ExternalLinkIcon } from "lucide-react";
import { ResourceIcon } from "@/features/roadmaps/ResourceIcon";
import { openUrl } from "@/platform/openUrl";
import { SectionLabel } from "./SectionLabel";

/** Lo que usas para hacer la tarea: los enlaces de sus notas y los recursos de su módulo. */
export function TaskResources({ resources }: { resources: Resource[] }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionLabel>Recursos</SectionLabel>
      {resources.map((resource) => (
        <button
          key={`${resource.title}:${resource.url}`}
          type="button"
          disabled={!resource.url}
          onClick={() => resource.url && void openUrl(resource.url)}
          className="flex items-center gap-3 rounded-md py-1 text-left enabled:hover:bg-muted"
        >
          <ResourceIcon kind={resource.kind} />
          <span className="truncate text-sm">{resource.title}</span>
          {resource.url && <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground" />}
          <span className="ml-auto truncate text-xs text-muted-foreground">{resource.source}</span>
        </button>
      ))}
    </section>
  );
}
