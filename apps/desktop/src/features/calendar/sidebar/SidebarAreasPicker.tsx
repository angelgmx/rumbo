import { filterAreas, type AreaNode } from "@rumbo/core";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVaultQuery } from "@/hooks/useVaultQuery";

/** «Elegir»: todas las áreas con casilla para decidir cuáles salen en la barra. */
export function SidebarAreasPicker() {
  const { areas } = useRumbo();
  const tree = useVaultQuery((r) => r.areas.tree()).data ?? [];
  const chosen = useVaultQuery((r) => r.areas.sidebarNames()).data ?? [];
  const [query, setQuery] = useState("");

  return (
    <Popover onOpenChange={() => setQuery("")}>
      <PopoverTrigger className="rounded px-1.5 text-[13px] font-medium text-primary-text">
        Elegir
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar área"
            aria-label="Buscar área"
            className="pl-8"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          <PickLevel
            nodes={filterAreas(tree, query)}
            chosen={chosen}
            onToggle={(name) => void areas.toggleInSidebar(name)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PickLevel({
  nodes,
  chosen,
  onToggle,
}: {
  nodes: readonly AreaNode[];
  chosen: readonly string[];
  onToggle: (name: string) => void;
}) {
  return (
    <ul className="flex flex-col">
      {nodes.map((node) => (
        <li key={node.name}>
          <label className="flex h-8 items-center gap-2 rounded-md px-1 text-[14px] hover:bg-muted/60">
            <Checkbox
              checked={chosen.includes(node.name)}
              onCheckedChange={() => onToggle(node.name)}
            />
            <span className="truncate">{node.name}</span>
          </label>
          {node.children.length > 0 && (
            <div className="ml-2 border-l pl-3">
              <PickLevel nodes={node.children} chosen={chosen} onToggle={onToggle} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
