import type { BlockKind, RoutineBlock } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { cn } from "@/lib/utils";
import { useReferenceOptions } from "./useReferenceOptions";

export const PICK_LABEL = {
  habit: "Elige un hábito",
  module: "Elige una ruta",
  task: "Elige una tarea",
} as const;

export type ReferenceKind = keyof typeof PICK_LABEL;

export function isReferenceKind(kind: BlockKind): kind is ReferenceKind {
  return kind in PICK_LABEL;
}

/** A qué apunta el bloque: su hábito, su ruta o su tarea; se cambia al pulsarlo. */
export function BlockReference({
  block,
  kind,
  onChange,
}: {
  block: RoutineBlock;
  kind: ReferenceKind;
  onChange: (ref: string) => void;
}) {
  const { routines } = useRumbo();
  const options = useReferenceOptions(kind);
  const label = options.find((option) => option.value === block.ref)?.label;

  return (
    <PropertyPopover
      label={PICK_LABEL[kind]}
      width="w-72"
      className={cn(
        "h-7 min-w-0 rounded-md px-2 text-xs",
        !block.ref && "text-muted-foreground/60",
      )}
      trigger={
        <span className="truncate">
          {block.ref
            ? (label ?? routines.blockName({ ...block, title: undefined }))
            : PICK_LABEL[kind]}
        </span>
      }
    >
      {(close) => (
        <OptionList
          options={options}
          value={block.ref}
          onChoose={(ref) => {
            if (!ref) return;
            onChange(ref);
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
