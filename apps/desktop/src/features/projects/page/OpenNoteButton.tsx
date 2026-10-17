import type { ProjectLink } from "@rumbo/core";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOpenLink } from "../links/useOpenLink";

/** «Abrir en Obsidian»: la primera nota del proyecto. Sin notas enlazadas, no sale. */
export function OpenNoteButton({ links }: { links: ProjectLink[] }) {
  const open = useOpenLink();
  const note = links.find((link) => link.kind === "note");
  if (!note) return null;

  return (
    <Button variant="outline" onClick={() => open(note)}>
      <ExternalLinkIcon data-icon="inline-start" />
      Abrir en Obsidian
    </Button>
  );
}
