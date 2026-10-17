import type { Task } from "@rumbo/core";
import { CheckCheckIcon, EyeIcon, LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiProvider } from "@/features/ai/useAiProvider";
import { useTaskOrganizer } from "@/features/task-organizer/TaskOrganizerProvider";

/**
 * «Organizar con IA»: la IA coloca en huecos libres las tareas sin fecha. La propuesta sale en la
 * rejilla, donde se acepta o se descarta; aquí también se pueden aceptar todas de una vez.
 */
export function OrganizeCard({ tasks }: { tasks: Task[] }) {
  const ready = useAiProvider() !== undefined;
  const organizer = useTaskOrganizer();
  const proposals = tasks.flatMap((task) => organizer.suggestionFor(task) ?? []);
  const placed = proposals.filter(({ proposal }) => proposal.date && proposal.time);
  if (!ready || (tasks.length === 0 && placed.length === 0)) return null;

  return (
    <section className="flex flex-col gap-1.5 rounded-xl border border-primary/30 bg-primary-soft p-3.5">
      <h2 className="flex items-center gap-2 text-[14.5px] font-semibold">
        <SparklesIcon className="size-4 text-primary-text" />
        Organizar con IA
      </h2>
      <p className="text-[13px] text-muted-foreground">
        {placed.length > 0
          ? `${placed.length} ${placed.length === 1 ? "propuesta" : "propuestas"} en el calendario.`
          : `Coloca ${tasks.length} sin fecha en huecos.`}
      </p>
      {placed.length > 0 ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-1 self-start"
          onClick={() => void organizer.acceptAll(placed)}
        >
          <CheckCheckIcon data-icon="inline-start" />
          Aceptar {placed.length === 1 ? "la propuesta" : "todas"}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-1 self-start"
          disabled={organizer.busy}
          onClick={() => void organizer.organize(tasks)}
        >
          {organizer.busy ? (
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
          ) : (
            <EyeIcon data-icon="inline-start" />
          )}
          Ver propuesta
        </Button>
      )}
    </section>
  );
}
