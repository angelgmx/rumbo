import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { cn } from "@/lib/utils";

/** Un campo del modal: su nombre encima y, debajo, el control. */
export function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/** Un campo del modal que se elige en un popover: caja con su icono y el valor. */
export function ChoiceField({
  icon: Icon,
  label,
  value,
  empty = "",
  width,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode | undefined;
  empty?: string;
  width?: string;
  children: (close: () => void) => ReactNode;
}) {
  return (
    <FormField label={label}>
      <PropertyPopover
        label={label}
        width={width}
        className={cn(
          "h-10 w-full rounded-lg border px-3",
          value === undefined && "text-muted-foreground",
        )}
        trigger={
          <>
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex min-w-0 items-center gap-2 truncate">{value ?? empty}</span>
          </>
        }
      >
        {children}
      </PropertyPopover>
    </FormField>
  );
}
