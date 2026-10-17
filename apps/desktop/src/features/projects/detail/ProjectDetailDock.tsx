import type { ProjectSummary } from "@rumbo/core";
import { DockedPanel } from "@/components/panel/DockedPanel";
import { ProjectDetail } from "./ProjectDetail";

/** El panel del proyecto abierto, fijo a la derecha de la lista. */
export function ProjectDetailDock({
  summary,
  onClose,
}: {
  summary: ProjectSummary | undefined;
  onClose: () => void;
}) {
  return (
    <DockedPanel open={summary !== undefined} label="Detalle del proyecto">
      {summary && <ProjectDetail key={summary.id} summary={summary} onClose={onClose} />}
    </DockedPanel>
  );
}
