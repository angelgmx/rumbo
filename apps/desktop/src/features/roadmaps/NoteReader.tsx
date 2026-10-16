import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo, useVaultVersion } from "@/app/RumboContext";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface NoteReaderProps {
  /** Ruta de la nota que se abre, o undefined para cerrar. */
  path?: string;
  onClose: () => void;
}

/** Panel lateral para leer una nota sin salir de la pantalla. Los enlaces abren otras notas aquí mismo. */
export function NoteReader({ path, onClose }: NoteReaderProps) {
  const { store } = useRumbo();
  // Se vuelve a pintar si la nota cambia (por ejemplo, la editas en Obsidian mientras la lees).
  useVaultVersion();
  // Historial dentro del panel, para volver atrás al seguir enlaces.
  const [trail, setTrail] = useState<string[]>([]);
  const currentPath = trail.at(-1) ?? path;
  const note = currentPath ? store.get(currentPath) : undefined;

  function openLinked(name: string) {
    const linked = store.findByName(name);
    if (linked) setTrail((old) => [...old, linked.path]);
  }

  function close() {
    setTrail([]);
    onClose();
  }

  return (
    <Sheet open={path !== undefined} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full gap-0 sm:max-w-2xl">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            {trail.length > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Volver"
                onClick={() => setTrail((old) => old.slice(0, -1))}
              >
                <ArrowLeftIcon />
              </Button>
            )}
            <FileTextIcon className="size-4 text-muted-foreground" />
            <SheetTitle>{note?.name ?? "Nota"}</SheetTitle>
          </div>
          <SheetDescription className="truncate font-mono text-xs">{currentPath}</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-6 py-5">
          {note ? (
            <Markdown source={note.body} onOpenNote={openLinked} />
          ) : (
            <p className="text-muted-foreground">No encuentro esa nota.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
