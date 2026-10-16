import { ChevronRightIcon, XIcon } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";

/** Cabecera de un panel lateral: dónde estás («Hábitos › Nuevo hábito») y cerrar. */
export function PanelHeader({ crumbs, onClose }: { crumbs: string[]; onClose: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-6">
      <nav aria-label="Dónde estás" className="mr-auto flex min-w-0 items-center gap-2 text-sm">
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb}>
            {index > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />}
            <span className={index < crumbs.length - 1 ? "text-muted-foreground" : "truncate"}>
              {crumb}
            </span>
          </Fragment>
        ))}
      </nav>
      <Button variant="ghost" size="icon" aria-label="Cerrar" onClick={onClose}>
        <XIcon />
      </Button>
    </header>
  );
}
