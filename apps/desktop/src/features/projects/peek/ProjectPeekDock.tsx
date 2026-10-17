import type { ProjectSummary } from "@rumbo/core";
import { useEffect } from "react";
import { DockedPanel } from "@/components/panel/DockedPanel";
import { ProjectPeek } from "./ProjectPeek";

/** La vista previa del proyecto elegido, fija a la derecha; Esc la cierra. */
export function ProjectPeekDock({
  summary,
  onClose,
}: {
  summary: ProjectSummary | undefined;
  onClose: () => void;
}) {
  const open = summary !== undefined;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <DockedPanel open={open} label="Vista previa del proyecto">
      {summary && <ProjectPeek key={summary.id} summary={summary} onClose={onClose} />}
    </DockedPanel>
  );
}
