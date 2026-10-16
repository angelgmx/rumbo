import type { ReactNode } from "react";
import { RemoveButton } from "../plan/PlanRow";

/** Una nota o un recurso del objetivo: se abre al pulsarlo y se quita con la cruz. */
export function LinkRow({
  icon,
  title,
  hint,
  onOpen,
  onRemove,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  onOpen?: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-center gap-1 pr-2 hover:bg-muted/50">
      <button
        type="button"
        disabled={!onOpen}
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
      >
        {icon}
        <span className="truncate font-medium">{title}</span>
        {hint && <span className="ml-auto truncate text-xs text-muted-foreground">{hint}</span>}
      </button>
      <RemoveButton label={`Quitar ${title}`} onClick={onRemove} />
    </div>
  );
}
