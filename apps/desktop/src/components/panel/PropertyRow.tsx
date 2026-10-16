import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PropertyPopover } from "./PropertyPopover";

/**
 * Una propiedad de la tarea: el nombre a la izquierda y, a la derecha, el valor,
 * que al pulsarlo abre su selector. Sin valor sale `empty`, apagado.
 */
export function PropertyRow({
  icon: Icon,
  label,
  value,
  empty = "—",
  width,
  children,
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode | undefined;
  empty?: string;
  width?: string;
  children: (close: () => void) => ReactNode;
}) {
  return (
    <div className="flex min-h-9 items-center gap-2">
      <span className="flex w-36 shrink-0 items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="truncate">{label}</span>
      </span>
      <PropertyPopover
        label={label}
        width={width}
        className={cn(
          "h-8 min-w-0 flex-1 rounded-md px-2",
          value === undefined && "text-muted-foreground/60",
        )}
        trigger={value ?? empty}
      >
        {children}
      </PropertyPopover>
    </div>
  );
}

/** La misma fila para un campo que se escribe en el sitio y puede ocupar varias líneas. */
export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="flex h-8 w-36 shrink-0 items-center truncate text-sm text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-2">{children}</div>
    </div>
  );
}

/** La misma fila, para un valor que viene de otra parte y no se cambia aquí. */
export function ReadOnlyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center gap-2">
      <span className="w-36 shrink-0 truncate text-sm text-muted-foreground">{label}</span>
      <div className="flex h-8 min-w-0 flex-1 items-center gap-2 px-2 text-sm">{children}</div>
    </div>
  );
}
