import type { HabitInput, HabitSummary } from "@rumbo/core";
import {
  ArchiveIcon,
  EllipsisIcon,
  FlameIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitForm } from "./HabitForm";

export function NewHabitButton() {
  const rumbo = useRumbo();
  const [open, setOpen] = useState(false);

  async function create(input: HabitInput) {
    await rumbo.habits.create(input);
    toast.success(`Hábito «${input.name.trim()}» creado`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <PlusIcon data-icon="inline-start" />
        Nuevo hábito
      </DialogTrigger>
      <HabitDialogContent title="Nuevo hábito">
        <HabitForm submitLabel="Crear hábito" onSubmit={create} onCancel={() => setOpen(false)} />
      </HabitDialogContent>
    </Dialog>
  );
}

/** Menú de cada hábito: editar, archivar o eliminar; si está archivado, recuperar o eliminar. */
export function HabitMenu({ summary }: { summary: HabitSummary }) {
  const rumbo = useRumbo();
  const { habit } = summary;
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function save(input: HabitInput) {
    await rumbo.habits.update(habit.key, input);
    toast.success("Hábito guardado");
    setEditing(false);
  }

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

      <Dialog open={editing} onOpenChange={setEditing}>
        <HabitDialogContent title="Editar hábito">
          <HabitForm
            initial={toInput(summary)}
            started={summary.habit.started}
            submitLabel="Guardar cambios"
            onSubmit={save}
            onCancel={() => setEditing(false)}
          />
        </HabitDialogContent>
      </Dialog>

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

function toInput({ habit }: HabitSummary): HabitInput {
  return {
    name: habit.name,
    kind: habit.kind,
    target: habit.target,
    unit: habit.unit,
    schedule: habit.schedule,
    area: habit.area,
    goal: habit.goal,
    icon: habit.icon,
    color: habit.color,
    start: habit.start,
    end: habit.end,
    until: habit.until,
  };
}

/** Marco común de los diálogos de hábito: cabecera con icono y el formulario debajo. */
function HabitDialogContent({ title, children }: { title: string; children: ReactNode }) {
  return (
    <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
      <DialogHeader className="flex-row items-center gap-3 border-b px-6 py-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-text">
          <FlameIcon className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>
            Algo que repites. Rumbo te dice cuándo toca y lleva tu racha.
          </DialogDescription>
        </div>
      </DialogHeader>
      {children}
    </DialogContent>
  );
}
