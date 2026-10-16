import type { ReactNode } from "react";
import { OptionList, type PropertyOption } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";

/** Una propiedad que se elige de una lista (proyecto, módulo, repetición…). */
export function OptionProperty({
  icon,
  label,
  clearLabel,
  empty,
  value,
  options,
  onChange,
}: {
  /** Va delante del valor elegido. */
  icon?: ReactNode;
  label: string;
  /** Texto de la fila que quita el valor; sin él, la propiedad siempre tiene uno. */
  clearLabel?: string;
  /** Lo que se lee cuando no hay valor. */
  empty?: string;
  value: string | undefined;
  options: PropertyOption[];
  onChange: (value: string | undefined) => void;
}) {
  // Un valor que la lista no ofrece (de otra herramienta, o de una nota borrada) se enseña tal cual.
  const choices =
    value && !options.some((option) => option.value === value)
      ? [...options, { value, label: value }]
      : options;
  const selected = choices.find((option) => option.value === value);

  return (
    <PropertyRow
      label={label}
      empty={empty}
      value={
        selected && (
          <>
            {icon}
            <span className="truncate">
              {selected.label}
              {selected.hint && ` · ${selected.hint}`}
            </span>
          </>
        )
      }
      width="w-64"
    >
      {(close) => (
        <OptionList
          options={choices}
          value={value}
          clearLabel={clearLabel}
          onChoose={(next) => {
            onChange(next);
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}
