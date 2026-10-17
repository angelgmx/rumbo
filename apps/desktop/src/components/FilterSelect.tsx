import { ChevronDownIcon } from "lucide-react";
import { OptionList, type PropertyOption } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";

/** Un filtro de una pantalla: «Área: todas ⌄». Al pulsarlo se elige una opción; `allLabel` las quita. */
export function FilterSelect({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  /** Lo que se lee cuando no hay nada elegido, y la opción que lo deja así. */
  allLabel: string;
  options: PropertyOption[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const chosen = options.find((option) => option.value === value);

  return (
    <PropertyPopover
      label={`Filtrar por ${label.toLowerCase()}`}
      width="w-64"
      className="h-9 rounded-lg border bg-card px-3"
      trigger={
        <>
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{chosen?.label ?? allLabel}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </>
      }
    >
      {(close) => (
        <OptionList
          options={options}
          value={value}
          clearLabel={allLabel}
          onChoose={(next) => {
            onChange(next);
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
