import type { ModuleSummary } from "@rumbo/core";
import { EllipsisIcon, Trash2Icon } from "lucide-react";
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

/** «…» de un módulo: eliminarlo de la ruta. */
export function ModuleMenu({ module }: { module: ModuleSummary }) {
  const rumbo = useRumbo();
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    try {
      await rumbo.roadmaps.removeModule(module);
      toast.success(`Módulo «${module.title}» eliminado`);
    } catch {
      toast.error("No se ha podido eliminar el módulo");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label="Opciones del módulo" />}
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2Icon />
            Eliminar módulo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`¿Eliminar «${module.title}»?`}
        description="Se borra la nota del módulo y sale de la ruta. Sus apuntes, ejercicios y retos se quedan donde están."
        onConfirm={remove}
      />
    </>
  );
}
