import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ColorCheck } from "../ColorCheck";

/** Una fuente del calendario: su casilla de color, su nombre y cuántas tareas ofrece; pulsarla abre su panel. */
export function SourceRow({
  icon,
  label,
  count,
  active,
  visibility,
  onOpen,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  active: boolean;
  /** Sin él la fuente no pinta nada en la rejilla y no tiene casilla. */
  visibility?: { color: string; shown: boolean; onToggle: () => void };
  onOpen: () => void;
}) {
  const shown = visibility?.shown ?? true;

  return (
    <div
      className={cn(
        "flex h-[34px] items-center gap-2.5 rounded-lg border border-transparent px-2.5 transition-colors duration-(--dur-fast) hover:bg-muted/60",
        active && "border-border bg-card shadow-card hover:bg-card",
      )}
    >
      {visibility ? (
        <ColorCheck
          checked={visibility.shown}
          color={visibility.color}
          label={`Mostrar ${label} en el calendario`}
          onToggle={visibility.onToggle}
        />
      ) : (
        <span aria-hidden className="size-4 shrink-0" />
      )}
      <button
        type="button"
        aria-expanded={active}
        onClick={onOpen}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2.5 text-[14px]",
          !shown && "text-muted-foreground",
        )}
      >
        <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
          {icon}
        </span>
        <span className="truncate">{label}</span>
        <span className="ml-auto font-mono text-[13px] text-muted-foreground">{count}</span>
        <ChevronRightIcon
          className={cn("size-3.5 shrink-0 text-faint", active && "text-foreground")}
        />
      </button>
    </div>
  );
}
