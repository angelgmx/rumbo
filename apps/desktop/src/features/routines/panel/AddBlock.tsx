import { BLOCK_KINDS, type BlockKind } from "@rumbo/core";
import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { OptionList } from "@/components/panel/OptionList";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BLOCK_KIND_HINT, BLOCK_KIND_ICON, BLOCK_KIND_LABEL } from "../look";
import { isReferenceKind, PICK_LABEL, type ReferenceKind } from "./BlockReference";
import { useReferenceOptions } from "./useReferenceOptions";

/** «Añadir bloque»: elige el tipo y, si apunta a algo (hábito, ruta, tarea), a qué. */
export function AddBlock({ onAdd }: { onAdd: (kind: BlockKind, ref?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<ReferenceKind>();

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setPicking(undefined);
  }

  function add(kind: BlockKind, ref?: string) {
    onAdd(kind, ref);
    onOpenChange(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={<Button variant="ghost" className="justify-start text-muted-foreground" />}
      >
        <PlusIcon data-icon="inline-start" />
        Añadir bloque
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-1 p-1.5">
        {picking ? (
          <ReferenceStep kind={picking} onBack={() => setPicking(undefined)} onChoose={add} />
        ) : (
          <ul className="flex flex-col">
            {BLOCK_KINDS.map((kind) => (
              <KindOption
                key={kind}
                kind={kind}
                onClick={() => (isReferenceKind(kind) ? setPicking(kind) : add(kind))}
              />
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function KindOption({ kind, onClick }: { kind: BlockKind; onClick: () => void }) {
  const Icon = BLOCK_KIND_ICON[kind];

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground"
      >
        <Icon />
        <span className="flex flex-col">
          <span className="text-sm">{BLOCK_KIND_LABEL[kind]}</span>
          <span className="text-xs text-muted-foreground">{BLOCK_KIND_HINT[kind]}</span>
        </span>
      </button>
    </li>
  );
}

function ReferenceStep({
  kind,
  onBack,
  onChoose,
}: {
  kind: ReferenceKind;
  onBack: () => void;
  onChoose: (kind: ReferenceKind, ref: string) => void;
}) {
  const options = useReferenceOptions(kind);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 rounded-md px-1 py-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {PICK_LABEL[kind]}
      </button>
      <OptionList
        options={options}
        value={undefined}
        onChoose={(ref) => ref && onChoose(kind, ref)}
      />
    </>
  );
}
