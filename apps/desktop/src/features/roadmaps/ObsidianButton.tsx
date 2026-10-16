import { ExternalLinkIcon } from "lucide-react";
import { useVaultRoot } from "@/app/VaultGate";
import { Button } from "@/components/ui/button";
import { openInObsidian } from "@/platform/openInObsidian";

/** Abre la nota en Obsidian, para editarla allí. */
export function ObsidianButton({ path, size }: { path: string; size?: "sm" | "default" }) {
  const root = useVaultRoot();
  return (
    <Button variant="outline" size={size} onClick={() => void openInObsidian(root, path)}>
      <ExternalLinkIcon data-icon="inline-start" />
      Abrir en Obsidian
    </Button>
  );
}
