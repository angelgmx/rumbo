import type { RoutineSummary } from "@rumbo/core";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** «…» de una rutina: editarla o eliminarla (con confirmación). */
export function RoutineMenu({
  summary,
  onEdit,
  className,
}: {
  summary: RoutineSummary;
  /** Abre la rutina para editarla; en el propio editor sobra. */
  onEdit?: () => void;
  className?: string;
}) {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    try {
      await rumbo.routines.remove(summary.id);
      toast.success(`«${summary.title}» eliminada`);
      navigate("/rutinas");
    } catch {
      toast.error("No se ha podido eliminar la rutina");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Opciones de ${summary.title}`}
              className={className}
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onEdit}>
                  <PencilIcon />
                  Editar
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
              <Trash2Icon />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`¿Eliminar «${summary.title}»?`}
        description="Se borra la nota de la rutina. Lo que ya hiciste (hábitos y tareas) se queda en tus notas. Si solo quieres dejarla un tiempo, mejor páusala."
        onConfirm={remove}
      />
    </>
  );
}
