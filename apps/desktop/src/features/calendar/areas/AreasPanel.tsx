import { filterAreas, ROUTINES_KEY, type AreaNode } from "@rumbo/core";
import { InboxIcon, RepeatIcon, SearchIcon, StarIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Visibility } from "../visibility";
import { AreaLevel } from "./AreaLevel";
import { VisibilityRow } from "./VisibilityRow";

const NEUTRAL = "var(--muted-foreground)";
const ROUTINES_COLOR = "#5b8def";

/** El contenido del popover: buscador, «Todas», el árbol de áreas y las dos fuentes que no son áreas. */
export function AreasPanel({
  areas,
  keys,
  starred,
  visibility,
}: {
  areas: AreaNode[];
  keys: string[];
  starred: readonly string[];
  visibility: Visibility;
}) {
  const [query, setQuery] = useState("");
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());
  const shown = filterAreas(areas, query);

  const fold = (name: string) =>
    setFolded((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar área"
            aria-label="Buscar área"
            className="pl-8"
          />
        </div>
        <button
          type="button"
          onClick={visibility.showAll}
          className="rounded px-1.5 text-[13px] font-medium text-primary-text"
        >
          Todas
        </button>
      </div>
      <motion.div layoutScroll className="max-h-80 overflow-y-auto">
        <AreaLevel
          nodes={shown}
          visibility={visibility}
          keys={keys}
          starred={starred}
          folded={folded}
          onFold={fold}
          searching={query.trim() !== ""}
        />
        {query.trim() === "" && (
          <div className="mt-1 border-t pt-1">
            <VisibilityRow
              icon={<InboxIcon />}
              label="Inbox"
              color={NEUTRAL}
              shown={!visibility.isHidden("inbox")}
              onToggle={() => visibility.toggle(["inbox"])}
              onOnly={() => visibility.showOnly(["inbox"], keys)}
            />
            <VisibilityRow
              icon={<RepeatIcon />}
              label="Rutinas"
              color={ROUTINES_COLOR}
              shown={!visibility.isHidden(ROUTINES_KEY)}
              onToggle={() => visibility.toggle([ROUTINES_KEY])}
              onOnly={() => visibility.showOnly([ROUTINES_KEY], keys)}
            />
          </div>
        )}
      </motion.div>
      {starred.length === 0 && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <StarIcon className="size-3.5 shrink-0" />
          Destaca un área con la estrella y saldrá en la barra.
        </p>
      )}
    </>
  );
}
