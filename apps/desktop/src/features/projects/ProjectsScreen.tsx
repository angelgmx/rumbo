import type { ProjectStatus } from "@rumbo/core";
import { PlusIcon, SquareKanbanIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { NewProjectDialog } from "./new/NewProjectDialog";
import { ProjectPeekDock } from "./peek/ProjectPeekDock";
import { ProjectFilterBar } from "./ProjectFilterBar";
import { matchingProjects, NO_FILTERS, type ProjectFilters } from "./projectFilters";
import { projectHref } from "./projectLabels";
import { projectsSummary } from "./projectsSummary";
import { ProjectViews, type View } from "./ProjectViews";

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Tablero" },
  { value: "list", label: "Lista" },
  { value: "gallery", label: "Galería" },
];

/**
 * Los proyectos en tablero, lista o galería. Un clic en uno abre su vista previa a la derecha;
 * un doble clic, o «Abrir proyecto», va a su página.
 */
export function ProjectsScreen() {
  const projects = useVaultQuery((r) => r.projects.list()).data ?? [];
  const [view, setView] = useState<View>("board");
  const [filters, setFilters] = useState<ProjectFilters>(NO_FILTERS);
  const [previewId, setPreviewId] = useState<number>();
  const [creating, setCreating] = useState<ProjectStatus>();
  const [, navigate] = useLocation();

  return (
    <>
      <ScreenHeader
        title="Proyectos"
        newTask={false}
        actions={
          <Button onClick={() => setCreating("idea")}>
            <PlusIcon data-icon="inline-start" />
            Nuevo proyecto
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Proyectos</h1>
              <p className="mt-1 text-muted-foreground">
                {projectsSummary(projects) || "Lo que construyes, con un final"}
              </p>
            </div>
            {projects.length > 0 && (
              <SegmentedControl label="Vista" options={VIEWS} value={view} onChange={setView} />
            )}
          </div>

          {projects.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SquareKanbanIcon />
                </EmptyMedia>
                <EmptyTitle>Todavía no tienes proyectos</EmptyTitle>
                <EmptyDescription>Crea el primero con «Nuevo proyecto».</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <ProjectFilterBar
                projects={projects}
                filters={filters}
                onChange={(changes) => setFilters({ ...filters, ...changes })}
              />
              <ProjectViews
                view={view}
                status={filters.status}
                projects={matchingProjects(projects, filters)}
                selectedId={previewId}
                onSelect={setPreviewId}
                onOpen={(id) => navigate(projectHref(id))}
                onCreate={setCreating}
              />
            </>
          )}
        </main>
        <ProjectPeekDock
          summary={projects.find(({ id }) => id === previewId)}
          onClose={() => setPreviewId(undefined)}
        />
      </div>
      <NewProjectDialog status={creating} onClose={() => setCreating(undefined)} />
    </>
  );
}
