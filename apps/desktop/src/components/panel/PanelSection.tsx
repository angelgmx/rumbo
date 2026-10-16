import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Un bloque del panel: separador fino, título con su icono, una acción opcional y aire. */
export function PanelSection({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: ReactNode;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t pt-6">
      <div className="flex min-h-6 items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}
