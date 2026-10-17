import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { cn } from "@/lib/utils";

/** Una propiedad en la fila de la cabecera: icono, nombre y valor, que al pulsarlo abre su selector. */
export function PropertyCell({
  icon: Icon,
  label,
  value,
  empty,
  width,
  trailing,
  className,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode | undefined;
  empty: string;
  width?: string;
  trailing?: ReactNode;
  className?: string;
  children: (close: () => void) => ReactNode;
}) {
  return (
    <div className={cn("flex min-w-56 flex-1 items-center bg-card pr-3", className)}>
      <PropertyPopover
        label={label}
        width={width}
        className="h-14 min-w-0 flex-1 gap-3 rounded-none px-5 whitespace-nowrap"
        trigger={
          <>
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{label}</span>
            <span
              className={cn(
                "flex min-w-0 items-center gap-2",
                value === undefined ? "text-muted-foreground/60" : "font-medium",
              )}
            >
              {value ?? empty}
            </span>
          </>
        }
      >
        {children}
      </PropertyPopover>
      {trailing}
    </div>
  );
}
