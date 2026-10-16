import type { OrganizeSuggestion } from "@rumbo/core";
import { CheckCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskOrganizer } from "./TaskOrganizerProvider";

/** «Aceptar todas»: aplica de una vez las propuestas de la vista. Solo sale con varias. */
export function AcceptAllButton({ suggestions }: { suggestions: OrganizeSuggestion[] }) {
  const organizer = useTaskOrganizer();
  if (suggestions.length < 2) return null;

  return (
    <Button variant="outline" onClick={() => void organizer.acceptAll(suggestions)}>
      <CheckCheckIcon data-icon="inline-start" />
      Aceptar todas ({suggestions.length})
    </Button>
  );
}
