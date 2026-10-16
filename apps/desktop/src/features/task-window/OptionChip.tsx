import { CheckIcon, SearchIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PropertyChip } from "./PropertyChip";

export interface ChipOption {
  value: string;
  label: string;
  /** Texto pequeño a la derecha, p. ej. la ruta de un módulo. */
  hint?: string;
}

const SEARCH_FROM = 8;

/** Una ficha que se elige de una lista; la primera fila quita el valor. */
export function OptionChip({
  icon,
  placeholder,
  clearLabel,
  value,
  options,
  onChange,
}: {
  icon: ReactNode;
  placeholder: string;
  clearLabel: string;
  value: string | undefined;
  options: ChipOption[];
  onChange: (value: string | undefined) => void;
}) {
  // Un valor que la lista no ofrece (de otra herramienta, o de una nota borrada) se enseña tal cual.
  const choices =
    value && !options.some((option) => option.value === value)
      ? [...options, { value, label: value }]
      : options;
  const selected = choices.find((option) => option.value === value);

  return (
    <PropertyChip
      icon={icon}
      label={selected?.label ?? placeholder}
      filled={selected !== undefined}
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
    </PropertyChip>
  );
}

function OptionList({
  options,
  value,
  clearLabel,
  onChoose,
}: {
  options: ChipOption[];
  value: string | undefined;
  clearLabel: string;
  onChoose: (value: string | undefined) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      {options.length >= SEARCH_FROM && (
        <label className="mb-1 flex items-center gap-2 rounded-md border px-2.5">
          <SearchIcon className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar…"
            className="h-8 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      )}
      <div className="flex max-h-64 flex-col overflow-y-auto">
        <OptionRow
          label={clearLabel}
          muted
          checked={value === undefined}
          onClick={() => onChoose(undefined)}
        />
        {visible.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            hint={option.hint}
            checked={option.value === value}
            onClick={() => onChoose(option.value)}
          />
        ))}
      </div>
    </>
  );
}

function OptionRow({
  label,
  hint,
  checked,
  muted = false,
  onClick,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
    >
      <CheckIcon className={checked ? "size-3.5 text-primary" : "size-3.5 opacity-0"} />
      <span className={muted ? "flex-1 truncate text-muted-foreground" : "flex-1 truncate"}>
        {label}
      </span>
      {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}
