import { type ProjectSummary, type UpcomingEntry } from "@rumbo/core";
import { ArrowRightIcon, PlayIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { taskRequest } from "@/features/session/requests";
import { useSession } from "@/features/session/SessionProvider";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

/** Lo siguiente con fecha (tareas e hitos) y el botón para empezar la siguiente tarea. */
export function ProjectNext({ summary: { upcoming, nextTasks } }: { summary: ProjectSummary }) {
  const rumbo = useRumbo();
  const session = useSession();
  const [next] = nextTasks;

  return (
    <SectionCard icon={ArrowRightIcon} title="Lo próximo">
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada con fecha todavía.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcoming.map((entry) => (
            <UpcomingRow
              key={
                entry.kind === "task" ? `task:${entry.task.id}` : `milestone:${entry.milestone.id}`
              }
              entry={entry}
            />
          ))}
        </ul>
      )}
      {next && (
        <Button className="w-fit" onClick={() => session.start(taskRequest(rumbo, next))}>
          <PlayIcon data-icon="inline-start" />
          Empezar
        </Button>
      )}
    </SectionCard>
  );
}

function UpcomingRow({ entry }: { entry: UpcomingEntry }) {
  const panel = useTaskPanel();
  const today = useRumbo().daily.today();
  const day = entry.date === today ? "Hoy" : formatDayMonth(entry.date);
  const when = entry.kind === "task" ? [day, entry.task.time].filter(Boolean).join(" ") : day;

  return (
    <li className="flex flex-col">
      <span
        className={cn(
          "font-mono text-xs text-muted-foreground",
          entry.date === today && "text-primary-text",
        )}
      >
        {when}
      </span>
      {entry.kind === "task" ? (
        <button
          type="button"
          onClick={() => panel.edit(entry.task)}
          className="w-fit rounded-sm text-left text-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {entry.task.text}
        </button>
      ) : (
        <span className="text-sm font-medium">Hito: {entry.milestone.title}</span>
      )}
    </li>
  );
}
