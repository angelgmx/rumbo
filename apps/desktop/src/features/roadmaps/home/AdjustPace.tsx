import type { RoadmapSummary } from "@rumbo/core";
import { GaugeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CatchUpChoices } from "../CatchUpChoices";

/** «Ajustar ritmo»: las salidas A, B y C que calcula la ruta cuando no llegas a la fecha. */
export function AdjustPace({ roadmap }: { roadmap: RoadmapSummary }) {
  if (roadmap.pace.state !== "behind") return null;
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <GaugeIcon data-icon="inline-start" />
        Ajustar ritmo
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 gap-2 p-3">
        <p className="px-1 text-sm font-medium">Tres formas de llegar a tu fecha</p>
        <CatchUpChoices roadmap={roadmap} />
      </PopoverContent>
    </Popover>
  );
}
