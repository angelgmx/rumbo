import type { RoutineBlock } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { cn } from "@/lib/utils";
import { BLOCK_KIND_LABEL } from "../look";
import { useReferenceOptions } from "./useReferenceOptions";

const PICK_LABEL = { habit: "Elige un hábito", module: "Elige un tema" } as const;
const TITLE_PLACEHOLDER = { task: "Nombre de la tarea", break: "Descanso", custom: "Título" };

/** Lo que dice el bloque: la nota a la que apunta (hábito, tema) o su título (los demás). */
export function BlockReference({
  block,
  onChange,
}: {
  block: RoutineBlock;
  onChange: (changes: Partial<RoutineBlock>) => void;
}) {
  if (block.kind === "habit" || block.kind === "module") {
    return <NotePicker block={{ ...block, kind: block.kind }} onChange={onChange} />;
  }
  return (
    <input
      value={block.title ?? ""}
      onChange={(event) => onChange({ title: event.target.value })}
      placeholder={TITLE_PLACEHOLDER[block.kind]}
      aria-label={`Título del bloque de ${BLOCK_KIND_LABEL[block.kind].toLowerCase()}`}
      className="h-8 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/60 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}

function NotePicker({
  block,
  onChange,
}: {
  block: RoutineBlock & { kind: "habit" | "module" };
  onChange: (changes: Partial<RoutineBlock>) => void;
}) {
  const { routines } = useRumbo();
  const options = useReferenceOptions(block.kind);
  const label = options.find((option) => option.value === block.ref)?.label;

  return (
    <PropertyPopover
      label={PICK_LABEL[block.kind]}
      width="w-72"
      className={cn("h-8 min-w-0 flex-1 rounded-md px-2", !block.ref && "text-muted-foreground/60")}
      trigger={
        <span className="truncate">
          {block.ref ? (label ?? routines.blockName(block)) : PICK_LABEL[block.kind]}
        </span>
      }
    >
      {(close) => (
        <OptionList
          options={options}
          value={block.ref}
          onChoose={(ref) => {
            onChange({ ref });
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
