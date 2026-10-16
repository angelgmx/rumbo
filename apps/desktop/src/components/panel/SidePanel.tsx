import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// Flota a 8 px de los bordes y entra deslizándose desde la derecha.
// Solo se anima el desplazamiento: la opacidad hace parpadear a WebKitGTK.
const FLOATING =
  "gap-0 p-0 duration-(--dur-slow) ease-(--ease-emphasis) data-starting-style:opacity-100 data-ending-style:opacity-100 data-[side=right]:inset-y-2 data-[side=right]:right-2 data-[side=right]:h-auto data-[side=right]:w-[calc(100%-1rem)] data-[side=right]:rounded-xl data-[side=right]:border data-[side=right]:shadow-card data-[side=right]:sm:max-w-[520px] data-[side=right]:data-starting-style:translate-x-[110%] data-[side=right]:data-ending-style:translate-x-[110%]";

/** El panel lateral de la app: tareas, hábitos y rutinas se crean y editan aquí. */
export function SidePanel({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  /** Para los lectores de pantalla. */
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent showCloseButton={false} className={FLOATING}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
