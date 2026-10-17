import { useState } from "react";

/** Lo que se ve en el calendario: cada fuente se muestra u oculta por su clave. */
export interface Visibility {
  isHidden: (key: string) => boolean;
  /** Muestra u oculta varias claves a la vez según esté la primera: así una área arrastra a sus subáreas. */
  toggle: (keys: string[]) => void;
  /** Deja visibles solo `keys` de entre todas las `among`. */
  showOnly: (keys: string[], among: string[]) => void;
  showAll: () => void;
}

const STORAGE_KEY = "rumbo.calendar.hidden";

/** Lo oculto se recuerda entre sesiones: es una preferencia de la ventana, no del vault. */
export function useVisibility(): Visibility {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(read);

  const commit = (next: ReadonlySet<string>) => {
    setHidden(next);
    write(next);
  };

  return {
    isHidden: (key) => hidden.has(key),
    toggle: (keys) => {
      const next = new Set(hidden);
      const show = hidden.has(keys[0]!);
      for (const key of keys) {
        if (show) next.delete(key);
        else next.add(key);
      }
      commit(next);
    },
    showOnly: (keys, among) => commit(new Set(among.filter((key) => !keys.includes(key)))),
    showAll: () => commit(new Set()),
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
