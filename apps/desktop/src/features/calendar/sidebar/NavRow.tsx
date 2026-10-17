import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Una fila de navegación de la barra: icono, nombre, cuántas hay y chevron; resaltada mientras su panel está abierto. */
export function NavRow({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "group/nav relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[14px] transition-colors duration-(--dur-fast) hover:bg-muted/60",
        active && "bg-primary/7 hover:bg-primary/7",
      )}
    >
      {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />}
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      <span className="rounded-full bg-muted px-2 font-mono text-[12px] leading-5 text-muted-foreground">
        {count}
      </span>
      <ChevronRightIcon
        className={cn(
          "size-3.5 shrink-0 text-faint transition-colors group-hover/nav:text-muted-foreground",
          active && "text-foreground group-hover/nav:text-foreground",
        )}
      />
    </button>
  );
}
