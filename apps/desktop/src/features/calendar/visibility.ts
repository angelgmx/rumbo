import { useState } from "react";

/** Lo que se ve en el calendario: cada fuente se muestra u oculta por su clave. */
export interface Visibility {
  isHidden: (key: string) => boolean;
  /** Muestra u oculta varias claves a la vez según esté la primera: así una área arrastra a sus subáreas. */
  toggle: (keys: string[]) => void;
}

const STORAGE_KEY = "rumbo.calendar.hidden";

// El azul de las láminas para la casilla de las rutinas, que no tienen un color propio.
export const ROUTINES_COLOR = "#5b8def";

/** Lo oculto se recuerda entre sesiones: es una preferencia de la ventana, no del vault. */
export function useVisibility(): Visibility {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(read);

  return {
    isHidden: (key) => hidden.has(key),
    toggle: (keys) => {
      const next = new Set(hidden);
      const show = hidden.has(keys[0]!);
      for (const key of keys) {
        if (show) next.delete(key);
        else next.add(key);
      }
      setHidden(next);
      write(next);
    },
  };
}

function read(): ReadonlySet<string> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(saved) ? saved.filter((key) => typeof key === "string") : []);
  } catch {
    return new Set();
  }
}

function write(hidden: ReadonlySet<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]));
  } catch {
    // Sin almacenamiento simplemente no se recuerda.
  }
}
