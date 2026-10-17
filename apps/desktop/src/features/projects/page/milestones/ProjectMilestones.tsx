import type { ProjectSummary } from "@rumbo/core";
import { FlagIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { MilestoneDraft } from "../../MilestoneDraft";
import { SectionCard } from "../SectionCard";
import { MilestoneTimeline } from "./MilestoneTimeline";

/** Los hitos del proyecto en una línea de tiempo, con un campo para añadir otro en su sitio. */
export function ProjectMilestones({ summary }: { summary: ProjectSummary }) {
  const { projects } = useRumbo();
  const [adding, setAdding] = useState(false);
  const { milestones } = summary.project;
  const done = milestones.filter((milestone) => milestone.done).length;

  return (
    <SectionCard
      icon={FlagIcon}
      title="Hitos"
      meta={milestones.length > 0 ? `${done} de ${milestones.length}` : undefined}
      action={
        <Button variant="link" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon data-icon="inline-start" />
          Añadir hito
        </Button>
      }
    >
      {milestones.length > 0 ? (
        <MilestoneTimeline summary={summary} />
      ) : (
        !adding && (
          <p className="text-sm text-muted-foreground">
            Los pasos grandes del proyecto, cada uno con su fecha.
          </p>
        )
      )}
      {adding && (
        <MilestoneDraft
          onAdd={(title, date) => {
            void projects.addMilestone(summary.id, title, date);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}
    </SectionCard>
  );
}
