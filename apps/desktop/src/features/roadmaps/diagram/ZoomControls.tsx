import { useReactFlow, useStore } from "@xyflow/react";
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import type { ComponentType } from "react";

const BUTTON =
  "grid size-7 place-items-center rounded-md text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-secondary hover:text-foreground";

function IconButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={BUTTON}>
      <Icon className="size-3.5" />
    </button>
  );
}

/** Alejar, porcentaje, acercar y encajar. */
export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((state) => state.transform[2]);

  return (
    <div className="flex items-center gap-1">
      <IconButton label="Alejar" icon={MinusIcon} onClick={() => zoomOut()} />
      <span className="w-10 text-center font-mono text-[11px]">{Math.round(zoom * 100)} %</span>
      <IconButton label="Acercar" icon={PlusIcon} onClick={() => zoomIn()} />
      <IconButton label="Encajar" icon={MaximizeIcon} onClick={() => fitView({ duration: 200 })} />
    </div>
  );
}
