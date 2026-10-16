import { useRumbo } from "@/app/RumboContext";

/** El título de un proyecto por su id en texto, como lo guardan los filtros. */
export function useProjectTitle(): (id: string) => string {
  const { projects } = useRumbo();
  return (id) => projects.get(Number(id))?.project.title ?? "Proyecto borrado";
}
