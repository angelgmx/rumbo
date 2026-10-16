import { CopyIcon, EllipsisIcon, SunIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteTaskDialog } from "./DeleteTaskDialog";

/** El menú «…» de la tarea: meterla en el foco de hoy, duplicarla o eliminarla (con confirmación). */
export function TaskMenu({
  inFocus,
  onToggleFocus,
  onDuplicate,
  onDelete,
}: {
  inFocus: boolean;
  onToggleFocus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon" aria-label="Más acciones" />}
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onToggleFocus}>
            <SunIcon />
            {inFocus ? "Quitar del foco de hoy" : "Al foco de hoy"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <CopyIcon />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2Icon />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteTaskDialog open={confirming} onOpenChange={setConfirming} onConfirm={onDelete} />
    </>
  );
}
