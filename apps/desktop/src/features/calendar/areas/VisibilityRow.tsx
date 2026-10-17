import type { ReactNode } from "react";
import { ColorCheck } from "@/components/ColorCheck";
import { cn } from "@/lib/utils";

/** Una fila con casilla de color para mostrar u ocultar algo; «Solo esta» sale al pasar el ratón. */
export function VisibilityRow({
  leading,
  trailing,
  icon,
  label,
  color,
  shown,
  onToggle,
  onOnly,
}: {
  /** Lo que va antes de la casilla: el asa de arrastre y el pliegue. */
  leading?: ReactNode;
  /** Lo que va después del nombre: la estrella. */
  trailing?: ReactNode;
  icon: ReactNode;
  label: string;
  color: string;
  shown: boolean;
  onToggle: () => void;
  onOnly: () => void;
}) {
  return (
    <div className="group/row flex h-8 items-center gap-2 rounded-md px-1 hover:bg-muted/60">
      {leading}
      <ColorCheck
        checked={shown}
        color={color}
        label={`Mostrar ${label} en el calendario`}
        onToggle={onToggle}
      />
      <span
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 text-[14px] [&_svg]:size-4 [&_svg]:shrink-0",
          !shown && "text-muted-foreground",
        )}
      >
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {trailing}
      <button
        type="button"
        onClick={onOnly}
        className="rounded px-1.5 text-[12.5px] text-primary-text opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
      >
        Solo esta
      </button>
    </div>
  );
}
