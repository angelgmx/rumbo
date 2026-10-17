import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Una tarjeta de la página del proyecto: su icono en un recuadro, el título, un dato y una acción. */
export function SectionCard({
  icon: Icon,
  title,
  meta,
  action,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  /** Un dato apagado junto al título, como «1 de 3». */
  meta?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card", className)}
    >
      <header className="flex min-h-9 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border">
          <Icon className="size-4" />
        </span>
        <h2 className="flex items-baseline gap-2">
          <span className="text-base font-semibold">{title}</span>
          {meta && <span className="text-sm text-muted-foreground">{meta}</span>}
        </h2>
        {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
      </header>
      {children}
    </section>
  );
}
