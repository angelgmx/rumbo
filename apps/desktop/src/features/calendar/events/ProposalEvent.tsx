import { addMinutesToTime, DEFAULT_TASK_MINUTES, type OrganizeSuggestion } from "@rumbo/core";
import { CheckIcon, SparklesIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskOrganizer } from "@/features/task-organizer/TaskOrganizerProvider";

/** Lo que propone la IA para una tarea sin fecha: un hueco en la rejilla que se acepta o se descarta. */
export function ProposalEvent({ suggestion }: { suggestion: OrganizeSuggestion }) {
  const organizer = useTaskOrganizer();
  const { task, proposal } = suggestion;
  const end = addMinutesToTime(
    proposal.time!,
    proposal.duration ?? task.duration ?? DEFAULT_TASK_MINUTES,
  );

  return (
    <div className="h-full overflow-hidden rounded-md border border-dashed border-primary bg-primary-soft px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <SparklesIcon className="size-3.5 shrink-0 text-primary-text" />
        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-5 font-medium">
          {task.text}
        </span>
      </div>
      <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">
        {proposal.time} – {end}
      </p>
      <div className="mt-1 flex gap-1">
        <Button
          size="icon-xs"
          aria-label="Aceptar la propuesta"
          onClick={() => void organizer.accept(suggestion)}
        >
          <CheckIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Descartar la propuesta"
          onClick={() => void organizer.dismiss(suggestion)}
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
}
