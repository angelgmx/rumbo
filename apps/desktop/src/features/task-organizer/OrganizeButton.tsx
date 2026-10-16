import { LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiProvider } from "@/features/ai/useAiProvider";
import { useAiSettings } from "@/features/ai/useAiSettings";
import { useTaskOrganizer } from "./TaskOrganizerProvider";

/** «Organizar con IA»: propone pasos y hora para las tareas sueltas que ya existen. Solo en modo Sugerir. */
export function OrganizeButton() {
  const { settings } = useAiSettings();
  const ready = useAiProvider() !== undefined;
  const organizer = useTaskOrganizer();
  if (!ready || settings?.organizeTasks !== "suggest") return null;

  return (
    <Button
      variant="outline"
      disabled={organizer.busy}
      onClick={() => void organizer.organizePending()}
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
