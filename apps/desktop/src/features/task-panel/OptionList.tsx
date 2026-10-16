import { CheckIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

export interface PropertyOption {
  value: string;
  label: string;
  /** Texto pequeño a la derecha, p. ej. el roadmap de un módulo. */
  hint?: string;
}

const SEARCH_FROM = 8;

/** Una lista para elegir; si se da `clearLabel`, la primera fila quita el valor. */
export function OptionList({
  options,
  value,
  clearLabel,
  onChoose,
}: {
  options: PropertyOption[];
  value: string | undefined;
  clearLabel?: string;
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
        {clearLabel && (
          <OptionRow
            label={clearLabel}
            muted
            checked={value === undefined}
            onClick={() => onChoose(undefined)}
          />
        )}
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
