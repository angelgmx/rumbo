import { areaFamily, areaKey, type AreaNode } from "@rumbo/core";
import { ChevronDownIcon, GripVerticalIcon } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { AreaIcon } from "@/components/AreaIcon";
import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";
import { AreaLevel, type AreaTreeShared } from "./AreaLevel";
import { VisibilityRow } from "./VisibilityRow";

export function AreaItem({
  node,
  onDrop,
  ...shared
}: { node: AreaNode; onDrop: () => void } & AreaTreeShared) {
  const { visibility, keys, folded, onFold, searching } = shared;
  const controls = useDragControls();
  const look = useArea(node.name);
  const family = areaFamily(node).map(areaKey);
  const hasChildren = node.children.length > 0;
  const unfolded = searching || !folded.has(node.name);

  return (
    <Reorder.Item
      as="li"
      value={node.name}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      // Solo la posición: con la escala por defecto, desplegar una madre deforma la fila al animarse su alto.
      layout="position"
    >
      <VisibilityRow
        leading={
          <>
            <button
              type="button"
              aria-label={`Mover ${node.name}`}
              disabled={searching}
              onPointerDown={(event) => controls.start(event)}
              className="flex size-4 shrink-0 cursor-grab touch-none items-center text-faint opacity-0 group-hover/row:opacity-100 active:cursor-grabbing disabled:invisible"
            >
              <GripVerticalIcon className="size-3.5" />
            </button>
            {hasChildren ? (
              <button
                type="button"
                aria-expanded={unfolded}
                aria-label={`Subáreas de ${node.name}`}
                disabled={searching}
                onClick={() => onFold(node.name)}
                className="flex size-4 shrink-0 items-center justify-center text-muted-foreground"
              >
                <ChevronDownIcon
                  className={cn("size-3.5 transition-transform", !unfolded && "-rotate-90")}
                />
              </button>
            ) : (
              <span aria-hidden className="size-4 shrink-0" />
            )}
          </>
        }
        icon={<AreaIcon area={look} className="size-6 rounded-md" />}
        label={node.name}
        color={look.color}
        shown={!visibility.isHidden(areaKey(node.name))}
        onToggle={() => visibility.toggle(family)}
        onOnly={() => visibility.showOnly(family, keys)}
      />
      {hasChildren && unfolded && (
        <div className="ml-6 border-l pl-1">
          <AreaLevel nodes={node.children} {...shared} />
        </div>
      )}
    </Reorder.Item>
  );
}
