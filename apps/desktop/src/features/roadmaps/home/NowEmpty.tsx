import type { TopicSummary } from "@rumbo/core";
import { CheckCheckIcon, PauseIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** Todas tus rutas están en pausa: la zona de «Ahora» ofrece reanudar la primera. */
export function AllPaused({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  return (
    <Empty className="flex-none border py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PauseIcon />
        </EmptyMedia>
        <EmptyTitle>Todas tus rutas están en pausa</EmptyTitle>
        <EmptyDescription>Cuando quieras volver, reanuda una y aparecerá aquí.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          onClick={() => rumbo.learning.setRoadmapStatus(roadmap, "active")}
        >
          Reanudar «{roadmap.title}»
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/** Has terminado todas las rutas: nada que empezar, solo las completadas debajo. */
export function AllCompleted() {
  return (
    <Empty className="flex-none border py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCheckIcon />
        </EmptyMedia>
        <EmptyTitle>Has completado todas tus rutas</EmptyTitle>
        <EmptyDescription>
          Están debajo por si quieres repasarlas. Una ruta nueva empieza como una nota «type:
          roadmap» en tu vault.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
