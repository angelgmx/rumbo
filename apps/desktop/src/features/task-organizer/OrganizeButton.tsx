import type { Task } from "@rumbo/core";
import { LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiProvider } from "@/features/ai/useAiProvider";
import { useTaskOrganizer } from "./TaskOrganizerProvider";

/** «Organizar con IA»: rellena lo que les falta a las tareas de la vista, sin tocar lo que ya tienen. */
export function OrganizeButton({ tasks }: { tasks: Task[] }) {
  const ready = useAiProvider() !== undefined;
  const organizer = useTaskOrganizer();
  if (!ready) return null;

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
