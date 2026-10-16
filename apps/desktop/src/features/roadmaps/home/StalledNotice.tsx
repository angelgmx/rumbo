import { idleDays, type TopicSummary } from "@rumbo/core";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/session/SessionProvider";
import { nextStep } from "./nextStep";

const SHORT_SESSION_MINUTES = 15;

/** Aviso discreto de una ruta parada: cuántos días llevas sin tocarla y dos salidas. */
export function StalledNotice({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const session = useSession();
  const roadmap = topic.roadmap!;
  const step = nextStep(topic);
  const days = idleDays(roadmap.lastActivity, rumbo.daily.today());

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        Llevas <span className="font-medium text-foreground">{days} días</span> sin tocar{" "}
        {roadmap.title}
      </span>
      {step && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => session.start(step.request(SHORT_SESSION_MINUTES))}
        >
          <PlayIcon data-icon="inline-start" />
          Empezar {SHORT_SESSION_MINUTES} min
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => rumbo.learning.setRoadmapStatus(roadmap, "paused")}
      >
        <PauseIcon data-icon="inline-start" />
        Pausar ruta
      </Button>
    </div>
  );
}
