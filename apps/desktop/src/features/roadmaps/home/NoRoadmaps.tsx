import { BookOpenIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function NoRoadmaps() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpenIcon />
        </EmptyMedia>
        <EmptyTitle>Todavía no tienes rutas</EmptyTitle>
        <EmptyDescription>
          Una ruta es una nota «type: roadmap» y sus módulos son notas «type: module» que dicen a
          qué ruta pertenecen.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
