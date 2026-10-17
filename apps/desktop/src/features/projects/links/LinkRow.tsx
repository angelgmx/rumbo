import type { ProjectLink } from "@rumbo/core";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LINK_ICON, linkDetail, linkTitle } from "./linkLook";
import { useOpenLink } from "./useOpenLink";

/**
 * Un enlace del proyecto con el icono de su tipo: pulsarlo lo abre. Con `onRemove` aparece
 * una cruz al pasar el ratón.
 */
export function LinkRow({ link, onRemove }: { link: ProjectLink; onRemove?: () => void }) {
  const open = useOpenLink();
  const Icon = LINK_ICON[link.kind];

  return (
    <div className="group flex items-center gap-3">
      <button
        type="button"
        onClick={() => open(link)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 text-left outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{linkTitle(link)}</span>
          <span className="truncate font-mono text-xs text-muted-foreground">
            {linkDetail(link)}
          </span>
        </span>
      </button>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Quitar ${linkTitle(link)}`}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={onRemove}
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
}
