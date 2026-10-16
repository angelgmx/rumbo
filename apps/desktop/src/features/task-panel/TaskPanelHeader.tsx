import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SheetClose, SheetTitle } from "@/components/ui/sheet";

/** Cabecera del panel: qué es, las acciones de la tarea y cerrar. */
export function TaskPanelHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 px-4">
      <SheetTitle className="mr-auto pl-2 text-sm font-normal text-muted-foreground">
        {title}
      </SheetTitle>
      {children}
      <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Cerrar" />}>
        <XIcon />
      </SheetClose>
    </header>
  );
}
