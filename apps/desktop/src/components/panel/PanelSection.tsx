import type { ReactNode } from "react";
import { SectionLabel } from "./SectionLabel";

/** Un bloque del panel: separador, título pequeño en mayúsculas, una acción opcional y aire. */
export function PanelSection({
  title,
  action,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t pt-5">
      <div className="flex min-h-6 items-center justify-between">
        <SectionLabel>{title}</SectionLabel>
        {action}
      </div>
      {children}
    </section>
  );
}
