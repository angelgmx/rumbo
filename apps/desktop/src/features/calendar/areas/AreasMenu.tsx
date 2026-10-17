import { areaFamily, areaKey, ROUTINES_KEY } from "@rumbo/core";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import type { Visibility } from "../visibility";
import { AreasPanel } from "./AreasPanel";

/** «Áreas ▾»: qué áreas (y subáreas) se ven en el calendario; enseña cuántas están ocultas. */
export function AreasMenu({ visibility }: { visibility: Visibility }) {
  const areas = useVaultQuery((r) => r.areas.tree()).data ?? [];
  const keys = ["inbox", ROUTINES_KEY, ...areas.flatMap(areaFamily).map(areaKey)];
  const hidden = keys.filter(visibility.isHidden).length;

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Áreas
        {hidden > 0 && (
          <span className="text-muted-foreground">
            {hidden} {hidden === 1 ? "oculta" : "ocultas"}
          </span>
        )}
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <AreasPanel areas={areas} keys={keys} visibility={visibility} />
      </PopoverContent>
    </Popover>
  );
}
