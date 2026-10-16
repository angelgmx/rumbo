import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SectionLabel } from "@/components/panel/SectionLabel";

/** Un bloque de lo que está vinculado al objetivo: su título con el número y sus filas. */
export function RelationSection({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <SectionLabel>{title}</SectionLabel>
        <span className="font-mono text-xs text-muted-foreground">{count}</span>
      </h3>
      <div className="flex flex-col divide-y rounded-xl border bg-card">{children}</div>
    </section>
  );
}
