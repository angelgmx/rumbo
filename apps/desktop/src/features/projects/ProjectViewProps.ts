import type { ProjectSummary } from "@rumbo/core";

/** Lo que reciben las vistas de proyectos (tablero, lista y galería): qué enseñar y qué hacer al pulsar. */
export interface ProjectViewProps {
  projects: ProjectSummary[];
  selectedId: number | undefined;
  /** Un clic: previsualizar el proyecto. */
  onSelect: (id: number) => void;
  /** Un doble clic: abrir su página. */
  onOpen: (id: number) => void;
}
