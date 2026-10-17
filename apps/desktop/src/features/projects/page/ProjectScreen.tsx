import { SquareKanbanIcon } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
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
import { ProjectMenu } from "../ProjectMenu";
import { OpenNoteButton } from "./OpenNoteButton";
import { ProjectHeading } from "./ProjectHeading";
import { ProjectNext } from "./ProjectNext";
import { ProjectOutcome } from "./ProjectOutcome";
import { ProjectProgress } from "./ProjectProgress";
import { ProjectProperties } from "./ProjectProperties";
import { ProjectResources } from "./ProjectResources";
import { ProjectMilestones } from "./milestones/ProjectMilestones";
import { ProjectTasks } from "./tasks/ProjectTasks";

/** La página de un proyecto: todo lo suyo a la vista, y cada cambio se guarda al momento. */
export function ProjectScreen() {
  const { id } = useParams<{ id: string }>();
  const summary = useVaultQuery((r) => r.projects.get(Number(id)), [id]).data;
  const [, navigate] = useLocation();

  return (
    <>
      <ScreenHeader
        title={
          <span className="flex items-center gap-2">
            <Link href="/proyectos" className="text-muted-foreground hover:text-foreground">
              Proyectos
            </Link>
            <span className="text-muted-foreground">›</span>
            {summary?.project.title}
          </span>
        }
        actions={
          summary && (
            <>
              <OpenNoteButton links={summary.project.links} />
              <ProjectMenu summary={summary} onGone={() => navigate("/proyectos")} />
            </>
          )
        }
      />
      {summary ? (
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-6">
            <ProjectHeading summary={summary} />
            <ProjectProperties summary={summary} />
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="flex min-w-0 flex-col gap-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)]">
                  <ProjectOutcome summary={summary} />
                  <ProjectMilestones summary={summary} />
                </div>
                <ProjectTasks summary={summary} />
              </div>
              <div className="flex min-w-0 flex-col gap-6">
                <ProjectProgress summary={summary} />
                <ProjectResources summary={summary} />
                <ProjectNext summary={summary} />
              </div>
            </div>
          </div>
        </main>
      ) : (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SquareKanbanIcon />
            </EmptyMedia>
            <EmptyTitle>Este proyecto ya no está</EmptyTitle>
            <EmptyDescription>Puede que lo hayas archivado o eliminado.</EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/proyectos" />}>Volver a proyectos</Button>
        </Empty>
      )}
    </>
  );
}
