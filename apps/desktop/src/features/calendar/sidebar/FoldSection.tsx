import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePersistedOpen } from "./usePersistedOpen";

/** Una sección de la barra con cabecera plegable: icono, título y un resumen a la derecha y, si se da, una acción. */
export function FoldSection({
  id,
  icon,
  title,
  summary,
  action,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  summary: string | number;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [open, toggle] = usePersistedOpen(id);

  return (
    <section className="flex flex-col">
      <div className="flex h-8 items-center gap-2 px-1">
        <button
          type="button"
          aria-expanded={open}
          onClick={toggle}
          className="flex h-8 min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDownIcon
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              !open && "-rotate-90",
            )}
          />
          <span className="flex size-4 items-center justify-center text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
          <span className="text-[15px] font-semibold">{title}</span>
          <span className="ml-auto text-[13px] text-muted-foreground">{summary}</span>
        </button>
        {action}
      </div>
      {open && children}
    </section>
  );
}
