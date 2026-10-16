import { createNewVault, createRumbo, type Rumbo } from "@rumbo/core";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";
import { tauriFileSystem } from "@/platform/tauriFileSystem";
import { pickVaultFolder, savedVaultPath, saveVaultPath } from "@/platform/vaultLocation";
import { watchVault } from "@/platform/watchVault";
import { RumboProvider } from "./RumboContext";

type GateState =
  | { status: "loading" }
  | { status: "welcome"; error?: string }
  | { status: "ready"; rumbo: Rumbo; root: string };

const ChangeVaultContext = createContext<() => void>(() => {});
const VaultRootContext = createContext("");

/** Abre el selector para cambiar a otro vault. */
export function useChangeVault(): () => void {
  return useContext(ChangeVaultContext);
}

/** Carpeta del vault abierto, para abrir sus notas en Obsidian. */
export function useVaultRoot(): string {
  return useContext(VaultRootContext);
}

/** Abre el vault guardado; si no hay ninguno, enseña la bienvenida para elegirlo. */
export function VaultGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ status: "loading" });

  const openVault = useCallback(async (root: string) => {
    try {
      const rumbo = await createRumbo(tauriFileSystem(root));
      setState({ status: "ready", rumbo, root });
    } catch (error) {
      setState({ status: "welcome", error: `No he podido abrir el vault: ${String(error)}` });
    }
  }, []);

  useEffect(() => {
    savedVaultPath().then((root) => (root ? openVault(root) : setState({ status: "welcome" })));
  }, [openVault]);

  // Lo que cambia en Obsidian (o en cualquier otro sitio) entra en la app.
  useEffect(() => {
    if (state.status !== "ready") return;
    const unwatch = watchVault(state.root, (path) => void state.rumbo.store.refresh(path));
    return () => void unwatch.then((stop) => stop());
  }, [state]);

  const chooseFolder = useCallback(async () => {
    const root = await pickVaultFolder();
    if (!root) return;
    await saveVaultPath(root);
    await openVault(root);
  }, [openVault]);

  const createVault = useCallback(async () => {
    const root = await pickVaultFolder();
    if (!root) return;
    await createNewVault(tauriFileSystem(root));
    await saveVaultPath(root);
    await openVault(root);
  }, [openVault]);

  if (state.status === "loading") return null;
  if (state.status === "welcome")
    return (
      <WelcomeScreen onOpenVault={chooseFolder} onCreateVault={createVault} error={state.error} />
    );
  return (
    <ChangeVaultContext value={chooseFolder}>
      <VaultRootContext value={state.root}>
        <RumboProvider rumbo={state.rumbo}>{children}</RumboProvider>
      </VaultRootContext>
    </ChangeVaultContext>
  );
}
