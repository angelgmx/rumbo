import type { ReactNode } from "react";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Card } from "@/components/ui/card";

/** Una tarjeta de la columna de resumen, con su título pequeño. */
export function AsideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="gap-3 px-5">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </Card>
  );
}
