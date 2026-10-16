import type { RoadmapSummary } from "@rumbo/core";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";

/** Mete en tu día lo que toca de la ruta y avisa de qué se ha añadido. */
export function useAddToToday(roadmap: RoadmapSummary): () => Promise<void> {
  const rumbo = useRumbo();
  return async () => {
    const text = await rumbo.learning.planToday(roadmap);
    if (text) toast.success("Añadido a hoy", { description: text });
  };
}
