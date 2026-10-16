import type { RoadmapSummary } from "@rumbo/core";
import { EllipsisIcon, PauseIcon, PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** «…» de la tarjeta: pausar o reanudar la ruta. Las terminadas no tienen nada que cambiar. */
export function RoadmapCardMenu({ roadmap }: { roadmap: RoadmapSummary }) {
  const rumbo = useRumbo();
  if (roadmap.status === "done") return null;
  const paused = roadmap.status === "paused";

  async function toggle() {
    await rumbo.learning.setRoadmapStatus(roadmap, paused ? "active" : "paused");
    toast.success(paused ? `«${roadmap.title}» reanudada` : `«${roadmap.title}» en pausa`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3"
            aria-label={`Opciones de ${roadmap.title}`}
          />
        }
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggle}>
          {paused ? <PlayIcon /> : <PauseIcon />}
          {paused ? "Reanudar" : "Pausar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
