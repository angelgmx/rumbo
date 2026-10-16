import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PropertyPopover } from "./PropertyPopover";

/**
 * Una propiedad de la tarea: el nombre a la izquierda y, a la derecha, el valor,
 * que al pulsarlo abre su selector. Sin valor sale `empty`, apagado.
 */
export function PropertyRow({
  label,
  value,
  empty = "—",
  width,
  children,
}: {
  label: string;
  value: ReactNode | undefined;
  empty?: string;
  width?: string;
  children: (close: () => void) => ReactNode;
}) {
  return (
    <div className="flex min-h-9 items-center gap-2">
      <span className="w-36 shrink-0 truncate text-sm text-muted-foreground">{label}</span>
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

/** La misma fila, para un valor que viene de otra parte y no se cambia aquí. */
export function ReadOnlyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center gap-2">
      <span className="w-36 shrink-0 truncate text-sm text-muted-foreground">{label}</span>
      <div className="flex h-8 min-w-0 flex-1 items-center gap-2 px-2 text-sm">{children}</div>
    </div>
  );
}
