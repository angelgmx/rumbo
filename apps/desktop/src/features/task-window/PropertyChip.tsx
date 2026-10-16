import type { ReactNode } from "react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Una ficha de la ventana de tarea: el valor a la vista y, al pulsarla, su selector.
 * Sin valor sale apagada con el nombre de la propiedad.
 */
export function PropertyChip({
  icon,
  label,
  filled,
  accent = false,
  width,
  children,
}: {
  icon: ReactNode;
  label: string;
  filled: boolean;
  accent?: boolean;
  width?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex h-8 max-w-60 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors duration-(--dur-fast) hover:bg-muted",
              !filled && "text-muted-foreground",
              accent &&
                filled &&
                "border-primary/60 bg-primary-soft text-primary-text hover:bg-primary-soft",
            )}
          />
        }
      >
        <span className="shrink-0 [&_svg]:size-3.5">{icon}</span>
        <span className="truncate">{label}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("gap-1 p-1.5", width)}>
        {children(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}
