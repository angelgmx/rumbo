import type { SyntheticEvent } from "react";

/**
 * Un clic en un menú o diálogo que sale de una tarjeta sube hasta ella por el árbol de React,
 * aunque esté fuera en pantalla. Solo cuenta lo que ocurre dentro de la propia tarjeta.
 */
export function ownEvent(handler: () => void) {
  return (event: SyntheticEvent) => {
    if (event.currentTarget.contains(event.target as Node)) handler();
  };
}
