import type { ProjectSummary } from "@rumbo/core";
import { ArchiveIcon, EllipsisIcon, SquareKanbanIcon, Trash2Icon, XIcon } from "lucide-react";
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

/** Qué es el panel, su menú «…» (archivar, eliminar con confirmación) y cerrarlo. */
export function ProjectDetailHeader({
  summary: { id, project },
  onClose,
}: {
  summary: ProjectSummary;
  onClose: () => void;
}) {
  const rumbo = useRumbo();
  const [confirming, setConfirming] = useState(false);

  async function archive() {
    await rumbo.projects.archive(id);
    toast.success(`«${project.title}» archivado`);
    onClose();
  }

  async function remove() {
    await rumbo.projects.remove(id);
    toast.success(`«${project.title}» eliminado`);
    onClose();
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-6">
      <span className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
        <SquareKanbanIcon className="size-4" />
        Proyecto
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon" aria-label="Más acciones" />}
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
      <Button variant="outline" size="icon" aria-label="Cerrar" onClick={onClose}>
        <XIcon />
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`¿Eliminar «${project.title}»?`}
        description="Sus tareas se quedan, sin proyecto. Si ya lo terminaste, mejor márcalo como «Terminado»."
        onConfirm={() => void remove()}
      />
    </header>
  );
}
