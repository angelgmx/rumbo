import type { ProjectSummary } from "@rumbo/core";
import { ArchiveIcon, EllipsisIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** El menú «…» del proyecto: archivarlo o eliminarlo (con confirmación). `onGone` avisa de que ya no está. */
export function ProjectMenu({
  summary: { id, project },
  size = "icon",
  onGone,
}: {
  summary: ProjectSummary;
  size?: "icon" | "icon-xs";
  onGone?: () => void;
}) {
  const { projects } = useRumbo();
  const [confirming, setConfirming] = useState(false);

  async function archive() {
    await projects.archive(id);
    toast.success(`«${project.title}» archivado`);
    onGone?.();
  }

  async function remove() {
    await projects.remove(id);
    toast.success(`«${project.title}» eliminado`);
    onGone?.();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant={size === "icon" ? "outline" : "ghost"}
              size={size}
              aria-label="Más acciones"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => void archive()}>
            <ArchiveIcon />
            Archivar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2Icon />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`¿Eliminar «${project.title}»?`}
        description="Sus tareas se quedan, sin proyecto. Si ya lo terminaste, mejor márcalo como «Terminado»."
        onConfirm={() => void remove()}
      />
    </>
  );
}
