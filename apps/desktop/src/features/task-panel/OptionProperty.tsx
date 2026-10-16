import type { ReactNode } from "react";
import { OptionList, type PropertyOption } from "./OptionList";
import { PropertyRow } from "./PropertyRow";

/** Una propiedad que se elige de una lista (prioridad, proyecto, duración…). */
export function OptionProperty({
  icon,
  label,
  clearLabel,
  value,
  options,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  /** Texto de la fila que quita el valor; sin él, la propiedad siempre tiene uno. */
  clearLabel?: string;
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
      icon={icon}
      label={label}
      value={selected && <OptionLabel option={selected} />}
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

function OptionLabel({ option }: { option: PropertyOption }) {
  return (
    <>
      <span className="truncate">{option.label}</span>
      {option.hint && <span className="truncate text-xs text-muted-foreground">{option.hint}</span>}
    </>
  );
}
