import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Button } from "@/components/ui/button";

/** Un bloque de la página: su título, una acción discreta a la derecha y, si hay, su contenido. */
export function GoalSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex min-h-7 items-center justify-between gap-2">
        <SectionLabel>{title}</SectionLabel>
        {action}
      </div>
      {children}
    </section>
  );
}

/** «+ Añadir» apagado: así se ofrece lo que aún está vacío, sin ocupar un bloque. */
export function AddAction({ label = "Añadir", onClick }: { label?: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={onClick}>
      <PlusIcon data-icon="inline-start" />
      {label}
    </Button>
  );
}
