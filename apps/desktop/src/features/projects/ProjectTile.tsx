import { AreaIcon } from "@/components/AreaIcon";
import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";

/** El cuadradito del proyecto, en el color de su área. */
export function ProjectTile({ area, className }: { area: string | undefined; className?: string }) {
  const look = useArea(area);
  return <AreaIcon area={{ ...look, icon: "square-kanban" }} className={cn("size-8", className)} />;
}
