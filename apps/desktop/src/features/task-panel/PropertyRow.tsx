import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Una propiedad de la tarea: icono y nombre a la izquierda, el valor a la derecha.
 * Al pulsar el valor se abre su selector; sin valor sale «Vacío» apagado.
 */
export function PropertyRow({
  icon,
  label,
  value,
  width,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode | undefined;
  width?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-8 items-center gap-2">
      <div className="flex w-36 shrink-0 items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={label}
              className={cn(
                "flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm transition-colors duration-(--dur-fast) outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted",
                value === undefined && "text-muted-foreground/60",
              )}
            />
          }
        >
          {value ?? "Vacío"}
        </PopoverTrigger>
        <PopoverContent align="start" className={cn("gap-1 p-1.5", width)}>
          {children(() => setOpen(false))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
