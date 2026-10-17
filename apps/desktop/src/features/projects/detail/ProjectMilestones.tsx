import type { ProjectSummary } from "@rumbo/core";
import { FlagIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { PanelSection } from "@/components/panel/PanelSection";
import { Button } from "@/components/ui/button";
import { MilestoneDraft } from "../MilestoneDraft";
import { MilestoneRow } from "./MilestoneRow";

/** Los hitos del proyecto en una línea del tiempo, con un campo para añadir otro en su sitio. */
export function ProjectMilestones({
  summary: { id, project, nextMilestone },
}: {
  summary: ProjectSummary;
}) {
  const { projects } = useRumbo();
  const [adding, setAdding] = useState(false);
  const { milestones } = project;
  const done = milestones.filter((milestone) => milestone.done).length;

  return (
    <PanelSection
      title={
        <>
          Hitos
          {milestones.length > 0 && (
            <span className="font-normal text-muted-foreground">
              {done} de {milestones.length}
            </span>
          )}
        </>
      }
      icon={FlagIcon}
      action={
        <Button variant="link" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon data-icon="inline-start" />
          Añadir hito
        </Button>
      }
    >
      {milestones.length > 0 && (
        <ol className="relative flex flex-col gap-1 before:absolute before:inset-y-3 before:left-2 before:w-px before:bg-border">
          {milestones.map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              projectId={id}
              milestone={milestone}
              next={nextMilestone?.id === milestone.id}
            />
          ))}
        </ol>
      )}
      {adding && (
        <MilestoneDraft
          onAdd={(title, date) => {
            void projects.addMilestone(id, title, date);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}
      {milestones.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          Los pasos grandes del proyecto, cada uno con su fecha.
        </p>
      )}
    </PanelSection>
  );
}
