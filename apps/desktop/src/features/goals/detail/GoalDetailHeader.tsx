import type { GoalSummary } from "@rumbo/core";
import { EllipsisIcon, TargetIcon, Trash2Icon, XIcon } from "lucide-react";
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

/** Qué es el panel, su menú «…» (eliminar, con confirmación) y cerrarlo. */
export function GoalDetailHeader({
  summary: { id, goal },
  onClose,
}: {
  summary: GoalSummary;
  onClose: () => void;
}) {
  const rumbo = useRumbo();
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    await rumbo.goals.remove(id);
    toast.success(`«${goal.title}» eliminado`);
    onClose();
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-6">
      <span className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
        <TargetIcon className="size-4" />
        Objetivo
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon" aria-label="Más acciones" />}
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
        title={`¿Eliminar «${goal.title}»?`}
        description="Sus proyectos y hábitos se quedan, sin objetivo. Si ya no lo persigues, mejor cámbialo a «Abandonado»."
        onConfirm={() => void remove()}
      />
    </header>
  );
}
