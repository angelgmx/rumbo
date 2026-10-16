import type { RoadmapSummary } from "@rumbo/core";
import { EllipsisIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

/** «…» de una ruta: añadir un módulo al final o eliminarla. */
export function RoadmapMenu({ roadmap }: { roadmap: RoadmapSummary }) {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const [adding, setAdding] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    try {
      await rumbo.roadmaps.remove(roadmap);
      toast.success(`Ruta «${roadmap.title}» eliminada`);
      navigate("/roadmaps");
    } catch {
      toast.error("No se ha podido eliminar la ruta");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon" aria-label="Opciones de la ruta" />}
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setAdding(true)}>
              <PlusIcon />
              Añadir módulo
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
              <Trash2Icon />
              Eliminar ruta
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddModuleDialog roadmap={roadmap} open={adding} onOpenChange={setAdding} />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`¿Eliminar «${roadmap.title}»?`}
        description={`Se borran la nota de la ruta y las de sus ${roadmap.modules.length} módulos. Tus apuntes, ejercicios y retos se quedan donde están.`}
        onConfirm={remove}
      />
    </>
  );
}

function AddModuleDialog({
  roadmap,
  open,
  onOpenChange,
}: {
  roadmap: RoadmapSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rumbo = useRumbo();
  const [title, setTitle] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await rumbo.roadmaps.addModule(roadmap, title);
    toast.success(`Módulo «${title.trim()}» añadido al final`);
    setTitle("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Añadir módulo</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Nombre del módulo"
            aria-label="Nombre del módulo"
          />
          <DialogFooter>
            <Button type="submit" disabled={!title.trim()}>
              Añadir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
