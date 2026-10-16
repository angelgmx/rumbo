import type { HabitSummary } from "@rumbo/core";
import {
  ArchiveIcon,
  EllipsisIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitPanel } from "./panel/HabitPanel";

export function NewHabitButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Nuevo hábito
      </Button>
      <HabitPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Menú de cada hábito: editar, archivar o eliminar; si está archivado, recuperar o eliminar. */
export function HabitMenu({ summary }: { summary: HabitSummary }) {
  const rumbo = useRumbo();
  const { habit } = summary;
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function archive() {
    await rumbo.habits.archive(habit.key);
    toast.success(`«${habit.name}» archivado. Su historial se guarda.`, {
      action: { label: "Deshacer", onClick: () => void rumbo.habits.restore(habit.key) },
    });
  }

  async function restore() {
    await rumbo.habits.restore(habit.key);
    toast.success(`«${habit.name}» vuelve a tus hábitos`);
  }

  async function remove() {
    await rumbo.habits.remove(habit.key);
    toast.success(`«${habit.name}» eliminado`);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Opciones de ${habit.name}`} />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            {habit.archived ? (
              <DropdownMenuItem onClick={restore}>
                <RotateCcwIcon />
                Recuperar
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <PencilIcon />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={archive}>
                  <ArchiveIcon />
                  Archivar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2Icon />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <HabitPanel open={editing} habit={habit} onClose={() => setEditing(false)} />

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar «{habit.name}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borra el hábito con todo lo que apuntaste. Si solo quieres dejar de verlo, mejor
              archívalo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
