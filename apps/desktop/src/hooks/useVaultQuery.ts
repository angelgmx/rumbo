import type { Rumbo } from "@rumbo/core";
import { useEffect, useState } from "react";
import { useRumbo, useVaultVersion } from "@/app/RumboContext";

export interface VaultQuery<T> {
  data: T | undefined;
  error: Error | undefined;
}

/**
 * Pide datos a core y los vuelve a pedir cada vez que cambia el vault.
 * Mientras llegan los nuevos se siguen enseñando los anteriores, así la pantalla no parpadea.
 */
export function useVaultQuery<T>(
  load: (rumbo: Rumbo) => T | Promise<T>,
  deps: unknown[] = [],
): VaultQuery<T> {
  const rumbo = useRumbo();
  const version = useVaultVersion();
  const [state, setState] = useState<VaultQuery<T>>({ data: undefined, error: undefined });

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

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
