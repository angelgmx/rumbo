import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_KINDS, type BlockKind, type RoutineBlock } from "@rumbo/core";
import { GripVerticalIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MinutesSelect } from "../editor/MinutesSelect";
import { BLOCK_KIND_ICON, BLOCK_KIND_LABEL } from "../look";
import { BlockReference } from "./BlockReference";

/** Un bloque de la rutina: su hora, de qué tipo es, qué es, cuánto dura y cómo quitarlo. */
export function BlockItem({
  id,
  block,
  start,
  onChange,
  onRetype,
  onRemove,
}: {
  id: string;
  block: RoutineBlock;
  /** La hora a la que empieza, calculada con los bloques anteriores. */
  start: string;
  onChange: (changes: Partial<RoutineBlock>) => void;
  onRetype: (kind: BlockKind) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border bg-card py-1.5 pr-1.5 pl-1",
        isDragging && "relative z-10 opacity-80 shadow-card",
      )}
    >
      <button
        type="button"
        aria-label="Arrastrar para ordenar"
        className="cursor-grab touch-none rounded p-1 text-faint hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground">{start}</span>
      <KindMenu kind={block.kind} onChoose={onRetype} />
      <BlockReference block={block} onChange={onChange} />
      <MinutesSelect value={block.minutes} onChange={(minutes) => onChange({ minutes })} />
      <Button variant="ghost" size="icon-sm" aria-label="Quitar bloque" onClick={onRemove}>
        <XIcon />
      </Button>
    </li>
  );
}

function KindMenu({ kind, onChoose }: { kind: BlockKind; onChoose: (kind: BlockKind) => void }) {
  const Icon = BLOCK_KIND_ICON[kind];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Tipo: ${BLOCK_KIND_LABEL[kind]}`}
            title={BLOCK_KIND_LABEL[kind]}
          />
        }
      >
        <Icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {BLOCK_KINDS.map((option) => {
          const OptionIcon = BLOCK_KIND_ICON[option];
          return (
            <DropdownMenuItem key={option} onClick={() => option !== kind && onChoose(option)}>
              <OptionIcon />
              {BLOCK_KIND_LABEL[option]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
