import type { Task } from "@rumbo/core";
import { CheckCheckIcon, LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiProvider } from "@/features/ai/useAiProvider";
import { useTaskOrganizer } from "@/features/task-organizer/TaskOrganizerProvider";

/**
 * «Organizar con IA»: coloca en huecos libres las tareas sin fecha. La propuesta sale en la
 * rejilla, donde se acepta o se descarta; con propuestas a la vista el botón las acepta todas.
 */
export function OrganizeButton({ tasks }: { tasks: Task[] }) {
  const ready = useAiProvider() !== undefined;
  const organizer = useTaskOrganizer();
  const placed = tasks
    .flatMap((task) => organizer.suggestionFor(task) ?? [])
    .filter(({ proposal }) => proposal.date && proposal.time);
  if (!ready || (tasks.length === 0 && placed.length === 0)) return null;

  if (placed.length > 0) {
    return (
      <Button variant="outline" onClick={() => void organizer.acceptAll(placed)}>
        <CheckCheckIcon data-icon="inline-start" />
        Aceptar {placed.length === 1 ? "la propuesta" : `${placed.length} propuestas`}
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      disabled={organizer.busy}
      onClick={() => void organizer.organize(tasks)}
    >
      {organizer.busy ? (
        <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
      ) : (
        <SparklesIcon data-icon="inline-start" />
      )}
      Organizar con IA
    </Button>
  );
}
