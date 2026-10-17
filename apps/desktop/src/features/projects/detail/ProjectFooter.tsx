import type { ProjectSummary } from "@rumbo/core";
import { PlayIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { taskRequest } from "@/features/session/requests";
import { useSession } from "@/features/session/SessionProvider";

/** Empezar la siguiente tarea del proyecto; sin tareas por hacer, el pie no sale. */
export function ProjectFooter({ summary: { nextTasks } }: { summary: ProjectSummary }) {
  const rumbo = useRumbo();
  const session = useSession();
  const [next] = nextTasks;
  if (!next) return null;

  return (
    <footer className="flex items-center justify-end border-t px-6 py-4">
      <Button onClick={() => session.start(taskRequest(rumbo, next))}>
        <PlayIcon data-icon="inline-start" />
        Empezar siguiente
      </Button>
    </footer>
  );
}
