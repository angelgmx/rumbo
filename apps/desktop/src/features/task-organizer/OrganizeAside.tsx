import type { Task } from "@rumbo/core";
import { CheckIcon, LoaderCircleIcon, SparklesIcon, XIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { describeSuggestion } from "./describeSuggestion";
import { useTaskOrganizer } from "./TaskOrganizerProvider";

/** Lo que la IA hace con una tarea suelta: «pensando…» o su propuesta, que se acepta o se descarta. */
export function OrganizeAside({ task }: { task: Task }) {
  const rumbo = useRumbo();
  const organizer = useTaskOrganizer();
  const suggestion = organizer.suggestionFor(task);

  if (organizer.isThinking(task)) {
    return (
      <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircleIcon className="size-3.5 animate-spin" />
        Pensando…
      </span>
    );
  }
  if (!suggestion) return null;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="flex h-8 max-w-80 items-center gap-2 rounded-lg border border-primary/40 bg-primary-soft px-2.5 text-sm">
        <SparklesIcon className="size-3.5 shrink-0 text-primary-text" />
        <span className="truncate">{describeSuggestion(suggestion, rumbo.daily.today())}</span>
      </span>
      <Button
        size="icon-sm"
        aria-label="Aceptar la propuesta"
        onClick={() => void organizer.accept(suggestion)}
      >
        <CheckIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Descartar la propuesta"
        onClick={() => void organizer.dismiss(suggestion)}
      >
        <XIcon />
      </Button>
    </div>
  );
}
