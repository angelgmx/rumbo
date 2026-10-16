import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Un valor que se edita al pulsarlo: el botón enseña `trigger` y abre su selector. */
export function PropertyPopover({
  label,
  trigger,
  className,
  width,
  children,
}: {
  label: string;
  trigger: ReactNode;
  className?: string;
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
            aria-label={label}
            className={cn(
              "flex items-center gap-2 text-left text-sm transition-colors duration-(--dur-fast) outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted",
              className,
            )}
          />
        }
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("gap-1 p-1.5", width)}>
        {children(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}
