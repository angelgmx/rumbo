import type { ProjectSummary } from "@rumbo/core";
import { CheckIcon, FlagIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { PanelSection } from "@/components/panel/PanelSection";
import { Textarea } from "@/components/ui/textarea";

/** Cómo sabrás que el proyecto está terminado, escrito y editado en su sitio. */
export function ProjectOutcome({ summary: { id, project } }: { summary: ProjectSummary }) {
  const rumbo = useRumbo();
  const [draft, setDraft] = useState<string>();

  function save() {
    const next = draft?.trim();
    setDraft(undefined);
    if (next !== undefined && next !== project.outcome) {
      void rumbo.projects.update(id, { outcome: next });
    }
  }

  return (
    <PanelSection
      title="Resultado"
      icon={FlagIcon}
      action={
        <span className="text-sm text-muted-foreground">¿cómo sabrás que está terminado?</span>
      }
    >
      {draft === undefined ? (
        <button
          type="button"
          aria-label="Resultado del proyecto"
          onClick={() => setDraft(project.outcome)}
          className="flex min-h-12 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors duration-(--dur-fast) outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {project.outcome ? (
            <>
              <CheckIcon className="size-4 shrink-0 text-success" />
              <span className="flex-1">{project.outcome}</span>
              <PencilIcon className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          ) : (
            <span className="text-muted-foreground/70">
              + Describe cómo sabrás que está terminado
            </span>
          )}
        </button>
      ) : (
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
          rows={2}
        />
      )}
    </PanelSection>
  );
}
