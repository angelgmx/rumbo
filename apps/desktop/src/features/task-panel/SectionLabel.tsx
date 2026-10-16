import type { ReactNode } from "react";

/** El título pequeño y en mayúsculas de cada bloque del panel: PROPIEDADES, PASOS… */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
      {children}
    </h3>
  );
}
