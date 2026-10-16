import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RoutineBlock } from "@rumbo/core";
import { GripVerticalIcon, XIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BLOCK_KIND_ICON, BLOCK_KIND_LABEL } from "../look";
import { BlockReference, isReferenceKind } from "./BlockReference";
import { MinutesSelect } from "./MinutesSelect";

/** Un bloque de la rutina: su hora, qué es, cuánto dura y cómo quitarlo; todo se edita en línea. */
export function BlockItem({
  id,
  block,
  start,
  onChange,
  onRemove,
}: {
  id: string;
  block: RoutineBlock;
  /** La hora a la que empieza, calculada con los bloques anteriores. */
  start: string;
  onChange: (changes: Partial<RoutineBlock>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const Icon = BLOCK_KIND_ICON[block.kind];

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-start gap-1.5 rounded-lg border bg-card py-1.5 pr-1.5 pl-1",
        isDragging && "relative z-10 opacity-80 shadow-card",
      )}
    >
      <button
        type="button"
        aria-label="Arrastrar para ordenar"
        className="mt-1 cursor-grab touch-none rounded p-1 text-faint hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <span className="mt-2 w-11 shrink-0 font-mono text-xs text-muted-foreground">{start}</span>
      <span
        role="img"
        title={BLOCK_KIND_LABEL[block.kind]}
        aria-label={BLOCK_KIND_LABEL[block.kind]}
        className="mt-2 text-muted-foreground [&_svg]:size-4"
      >
        <Icon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <BlockTitle block={block} onChange={(title) => onChange({ title })} />
        {isReferenceKind(block.kind) && (
          <BlockReference block={block} kind={block.kind} onChange={(ref) => onChange({ ref })} />
        )}
      </div>
      <MinutesSelect value={block.minutes} onChange={(minutes) => onChange({ minutes })} />
      <Button variant="ghost" size="icon-sm" aria-label="Quitar bloque" onClick={onRemove}>
        <XIcon />
      </Button>
    </li>
  );
}

function BlockTitle({
  block,
  onChange,
}: {
  block: RoutineBlock;
  onChange: (title: string | undefined) => void;
}) {
  const { routines } = useRumbo();
  const placeholder =
    block.kind === "activity"
      ? "Café, estirar…"
      : routines.blockName({ ...block, title: undefined });

  return (
    <input
      value={block.title ?? ""}
      onChange={(event) => onChange(event.target.value || undefined)}
      placeholder={placeholder}
      aria-label={`Título del bloque de ${BLOCK_KIND_LABEL[block.kind].toLowerCase()}`}
      className="h-8 min-w-0 rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/60 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}
