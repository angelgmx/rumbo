import type { ProjectStatus } from "@rumbo/core";
import { SearchXIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ProjectBoard } from "./ProjectBoard";
import { ProjectGallery } from "./ProjectGallery";
import { type StatusFilter, visibleStatuses } from "./projectFilters";
import { ProjectTable } from "./ProjectTable";
import type { ProjectViewProps } from "./ProjectViewProps";

export type View = "board" | "list" | "gallery";

/** La vista elegida con los proyectos que pasan los filtros; si ninguno pasa, lo dice. */
export function ProjectViews({
  view,
  status,
  onCreate,
  ...props
}: ProjectViewProps & {
  view: View;
  status: StatusFilter;
  onCreate: (status: ProjectStatus) => void;
}) {
  if (props.projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Ningún proyecto coincide</EmptyTitle>
          <EmptyDescription>Prueba con otro filtro o con otra búsqueda.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  if (view === "board") return <ProjectBoard {...props} status={status} onCreate={onCreate} />;
  if (view === "list") return <ProjectTable {...props} status={status} />;
  return (
    <ProjectGallery
      {...props}
      projects={props.projects.filter(({ project }) =>
        visibleStatuses(status).includes(project.status),
      )}
    />
  );
}
