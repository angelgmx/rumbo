import type { ReactNode } from "react";

/** Un grupo de propiedades con su nombre encima: Cuándo, Dónde, Esfuerzo. */
export function PropertyGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <h4 className="mb-1 text-xs font-semibold text-foreground/80">{title}</h4>
      {children}
    </div>
  );
}
