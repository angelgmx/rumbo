import type { TopicSummary } from "@rumbo/core";
import { Link } from "wouter";
import { AreaIcon } from "@/components/AreaIcon";
import { Progress } from "@/components/ui/progress";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { roadmapHref } from "../links";
import { PaceChip } from "./PaceChip";
import { modulePercent } from "./roadmapList";
import { RoadmapCardMenu } from "./RoadmapCardMenu";

/** Una ruta en la lista: cuánto llevas, qué módulo toca, si llegas y cuánto queda. */
export function RoadmapCard({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!;
  const percent = modulePercent(roadmap);

  return (
    <div className="relative">
      <Link
        href={roadmapHref(topic.path)}
        className="flex h-full flex-col gap-4 rounded-xl border bg-card p-4 shadow-card transition-colors duration-(--dur-fast) outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex items-center gap-3 pr-8">
          <AreaIcon area={{ icon: topic.icon, color: topic.color ?? "var(--muted-foreground)" }} />
          <div className="min-w-0">
            <div className="truncate font-medium">{roadmap.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {topic.area ? `${topic.area.title} › ${topic.title}` : topic.title}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Progress
            value={percent}
            className={cn(
              "h-1.5",
              roadmap.status !== "active" &&
                "[&_[data-slot=progress-indicator]]:bg-muted-foreground",
            )}
          />
          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span>
              {roadmap.mastered} de {roadmap.modules.length} módulos
            </span>
            <span>{percent} %</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <p className="truncate text-sm text-muted-foreground">{nextLabel(topic)}</p>
          <div className="flex items-center justify-between gap-3">
            <PaceChip roadmap={roadmap} />
            {roadmap.current && (
              <span className="font-mono text-xs text-muted-foreground">
                {formatMinutes(roadmap.plan.remainingMinutes)} restantes
              </span>
            )}
          </div>
        </div>
      </Link>
      <RoadmapCardMenu roadmap={roadmap} />
    </div>
  );
}

/** «Siguiente · módulo 4/11 · Bucles», o «Ruta terminada» si no queda ninguno. */
function nextLabel({ roadmap }: TopicSummary): string {
  const next = roadmap!.current;
  if (!next) return "Ruta terminada";
  return `Siguiente · módulo ${roadmap!.modules.indexOf(next) + 1}/${roadmap!.modules.length} · ${next.title}`;
}
