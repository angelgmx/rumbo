import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface FilterOption {
  value: string;
  count: number;
  icon?: ReactNode;
}

/**
 * Un filtro de la lista: «+ Área» sin elegir; «Área: Negocio ×» cuando hay uno.
 * Al pulsarlo se abre la lista de opciones con su número de tareas.
 */
export function FilterChip({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visible = options.filter((option) =>
    option.value.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function choose(next: string | undefined) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  if (options.length === 0 && !value) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center rounded-lg border">
        <PopoverTrigger render={<Button variant="ghost" size="sm" className="rounded-r-none" />}>
          {value ? (
            <span>
              <span className="text-muted-foreground">{label}:</span> {value}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <PlusIcon className="size-3.5" />
              {label}
            </span>
          )}
        </PopoverTrigger>
        {value && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-l-none"
            aria-label={`Quitar el filtro de ${label.toLowerCase()}`}
            onClick={() => onChange(undefined)}
          >
            <XIcon />
          </Button>
        )}
      </div>
      <PopoverContent align="start" className="w-72 gap-2 p-2">
        <div className="flex items-center justify-between px-2 pt-1 text-sm">
          <span className="font-medium">Filtrar por {label.toLowerCase()}</span>
          {value && (
            <button
              type="button"
              onClick={() => choose(undefined)}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </button>
          )}
        </div>
        {options.length > 6 && (
          <label className="flex items-center gap-2 rounded-md border px-2.5">
            <SearchIcon className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar ${label.toLowerCase()}…`}
              className="h-8 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        )}
        <div className="flex max-h-64 flex-col overflow-y-auto">
          {visible.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value === value ? undefined : option.value)}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
            >
              <Checkbox checked={option.value === value} tabIndex={-1} aria-hidden />
              {option.icon}
              <span className="flex-1 truncate">{option.value}</span>
              <span className="font-mono text-xs text-muted-foreground">{option.count}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
