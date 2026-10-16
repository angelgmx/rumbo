import type { Rumbo } from "@rumbo/core";
import { useEffect, useState } from "react";
import { useRumbo, useVaultVersion } from "@/app/RumboContext";

export interface VaultQuery<T> {
  data: T | undefined;
  error: Error | undefined;
}

/**
 * Pide datos a core y los vuelve a pedir cada vez que cambia el vault.
 * Casi todo sale del índice en memoria, así que la primera vez se calcula en el propio
 * render: la pantalla entra ya con sus datos. Mientras llegan datos nuevos se siguen
 * enseñando los anteriores, así no parpadea.
 */
export function useVaultQuery<T>(
  load: (rumbo: Rumbo) => T | Promise<T>,
  deps: unknown[] = [],
): VaultQuery<T> {
  const rumbo = useRumbo();
  const version = useVaultVersion();
  const [state, setState] = useState<VaultQuery<T>>(() => loadNow(load, rumbo));

  useEffect(() => {
    let current = true;
    Promise.resolve()
      .then(() => load(rumbo))
      .then(
        (data) => current && setState({ data, error: undefined }),
        (error: unknown) => current && setState((old) => ({ ...old, error: toError(error) })),
      );
    return () => {
      current = false;
    };
    // `load` cambia en cada render; lo que importa es el vault y las dependencias que pasa quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rumbo, version, ...deps]);

  return state;
}

/** Si la carga es síncrona, el resultado ya; si es asíncrona, se espera en el efecto. */
function loadNow<T>(load: (rumbo: Rumbo) => T | Promise<T>, rumbo: Rumbo): VaultQuery<T> {
  try {
    const result = load(rumbo);
    if (result instanceof Promise) {
      result.catch(() => {}); // el efecto la vuelve a pedir y gestiona el error
      return { data: undefined, error: undefined };
    }
    return { data: result, error: undefined };
  } catch (error) {
    return { data: undefined, error: toError(error) };
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
