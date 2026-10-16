import type { Rumbo } from "@rumbo/core";
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

const RumboContext = createContext<Rumbo | null>(null);

export function RumboProvider({ rumbo, children }: { rumbo: Rumbo; children: ReactNode }) {
  return <RumboContext value={rumbo}>{children}</RumboContext>;
}

export function useRumbo(): Rumbo {
  const rumbo = useContext(RumboContext);
  if (!rumbo) throw new Error("useRumbo needs a RumboProvider");
  return rumbo;
}

/** Número que cambia cada vez que cambia algo, en el vault o en la base de datos. */
export function useVaultVersion(): number {
  const { changes } = useRumbo();
  return useSyncExternalStore(
    (listener) => changes.subscribe(listener),
    () => changes.version,
  );
}
