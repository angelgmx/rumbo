import { SquareKanbanIcon } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { ProjectDetailDock } from "./detail/ProjectDetailDock";
import { NewProjectButton } from "./new/NewProjectButton";
import { ProjectBoard } from "./ProjectBoard";
import { ProjectList } from "./ProjectList";
import { GROUPS } from "./projectLabels";
import { UpcomingMilestones } from "./UpcomingMilestones";

type View = "board" | "list";

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Tablero" },
  { value: "list", label: "Lista" },
];

/** Los proyectos en lista o tablero; al abrir uno, su panel entra a la derecha. */
export function ProjectsScreen() {
  const projects = useVaultQuery((r) => r.projects.list()).data ?? [];
  const [view, setView] = useState<View>("list");
  const [, navigate] = useLocation();
  const { id } = useParams<{ id?: string }>();
  const selected = projects.find((summary) => summary.id === Number(id));

  const counts = GROUPS.map(({ status, one, many }) => {
    const count = projects.filter(({ project }) => project.status === status).length;
    return count > 0 ? `${count} ${count === 1 ? one : many}` : undefined;
  }).filter(Boolean);

  return (
    <>
      <ScreenHeader
        title={
          selected ? (
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">Proyectos</span>
              <span className="text-muted-foreground">›</span>
              {selected.project.title}
            </span>
          ) : (
            "Proyectos"
          )
        }
        newTask={false}
        actions={<NewProjectButton />}
      />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Proyectos</h1>
              <p className="mt-1 text-muted-foreground">
                {counts.length === 0 ? "Lo que construyes, con un final" : counts.join(" · ")}
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
          ) : view === "board" ? (
            <ProjectBoard projects={projects} />
          ) : (
            <ProjectList projects={projects} selectedId={selected?.id} />
          )}
          {view === "list" && <UpcomingMilestones />}
        </main>
        <ProjectDetailDock summary={selected} onClose={() => navigate("/proyectos")} />
      </div>
    </>
  );
}
