import type { ProjectLink } from "@rumbo/core";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { useVaultRoot } from "@/app/VaultGate";
import { openInObsidian } from "@/platform/openInObsidian";
import { openUrl } from "@/platform/openUrl";

/** Abre un enlace: las direcciones en el navegador y las notas en Obsidian. */
export function useOpenLink(): (link: ProjectLink) => void {
  const { store } = useRumbo();
  const root = useVaultRoot();

  return (link) => {
    if (link.kind !== "note") {
      void openUrl(link.url);
      return;
    }
    const note = store.findByName(link.name);
    if (note) void openInObsidian(root, note.path);
    else toast.error(`La nota «${link.name}» ya no está en el vault`);
  };
}
