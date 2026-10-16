import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

/** Pie de un panel: algo a la izquierda (`children`), el atajo y el botón que guarda. */
export function PanelFooter({
  label,
  disabled,
  onSubmit,
  children,
}: {
  label: string;
  disabled?: boolean;
  onSubmit: () => void;
  children?: ReactNode;
}) {
  return (
    <footer className="flex items-center gap-3 border-t px-6 py-4">
      {children}
      <Kbd className="ml-auto">Ctrl Enter</Kbd>
      <Button type="button" disabled={disabled} onClick={onSubmit}>
        {label}
      </Button>
    </footer>
  );
}
