import type { ProjectSummary } from "@rumbo/core";
import { CheckIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "./SectionCard";

/** Cómo sabrás que el proyecto está terminado, escrito y editado en su sitio. */
export function ProjectOutcome({ summary: { id, project } }: { summary: ProjectSummary }) {
  const { projects } = useRumbo();
  const [draft, setDraft] = useState<string>();

  function save() {
    const next = draft?.trim();
    setDraft(undefined);
    if (next !== undefined && next !== project.outcome) void projects.update(id, { outcome: next });
  }

  return (
    <SectionCard
      icon={CheckIcon}
      title="Resultado"
      action={
        draft === undefined && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar el resultado"
            onClick={() => setDraft(project.outcome)}
          >
            <PencilIcon />
          </Button>
        )
      }
    >
      <p className="text-sm text-muted-foreground">¿Cómo sabrás que está terminado?</p>
      {draft !== undefined ? (
        <Textarea
          autoFocus
          aria-label="Resultado del proyecto"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              save();
            }
            if (event.key === "Escape") {
              event.stopPropagation();
              setDraft(undefined);
            }
          }}
          rows={3}
        />
      ) : project.outcome ? (
        <p className="text-lg leading-snug font-semibold">{project.outcome}</p>
      ) : (
        <button
          type="button"
          onClick={() => setDraft("")}
          className="w-fit rounded-sm text-left text-sm text-muted-foreground/70 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          + Describe cómo sabrás que está terminado
        </button>
      )}
    </SectionCard>
  );
}
