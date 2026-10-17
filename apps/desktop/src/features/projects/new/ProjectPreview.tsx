import { daysBetween } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { AreaIllustration } from "@/components/AreaIllustration";
import { Progress } from "@/components/ui/progress";
import { AreaDot } from "@/features/tasks/AreaDot";
import { useArea } from "@/hooks/useArea";
import { dueLabel } from "../projectLabels";
import { FormField } from "./FormField";
import type { ProjectDraft } from "./useProjectDraft";

/** «Así quedará»: la tarjeta del proyecto con lo que se lleva escrito. */
export function ProjectPreview({ draft }: { draft: ProjectDraft }) {
  const today = useRumbo().daily.today();
  const area = useArea(draft.area);
  const { milestones, tasks, deadline, title } = draft;
  const facts = [
    tasks.length === 0
      ? "Sin tareas"
      : `${tasks.length} ${tasks.length === 1 ? "tarea" : "tareas"}`,
    deadline && dueLabel(daysBetween(today, deadline)),
  ].filter(Boolean);

  return (
    <FormField label="Así quedará">
      <div className="overflow-hidden rounded-xl border">
        <AreaIllustration icon={area.icon} className="h-24 w-full" />
        <div className="flex flex-col gap-2 p-4">
          {draft.area && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <AreaDot area={draft.area} />
              {draft.area}
            </span>
          )}
          <span className={title.trim() ? "font-semibold" : "font-semibold text-muted-foreground"}>
            {title.trim() || "Nombre del proyecto"}
          </span>
          <span className="text-sm text-muted-foreground">
            {milestones.length === 0
              ? "Sin hitos todavía"
              : `${milestones.length} ${milestones.length === 1 ? "hito" : "hitos"}`}
          </span>
          <span className="flex items-center gap-3">
            <Progress value={0} aria-label="Progreso" className="flex-1 flex-nowrap" />
            <span className="font-mono text-xs text-muted-foreground">0/{milestones.length}</span>
          </span>
          <span className="text-sm text-muted-foreground">{facts.join(" · ")}</span>
        </div>
      </div>
    </FormField>
  );
}
