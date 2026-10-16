import type { TopicSummary } from "@rumbo/core";
import { ArrowRightIcon, CalendarIcon, FlagIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { AreaIllustration } from "@/components/AreaIllustration";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { checkpointLabel, checkpoints, nextCheckpoint } from "./checkpoints";
import { moduleHref, roadmapHref } from "./links";
import { paceDetail, paceLabel } from "./paceLabels";
import { Tag } from "./Tag";

const STATUS_TAG = { planned: "Planificada", paused: "Pausada", done: "Terminada" } as const;

/** Una ruta en la galería: de un vistazo, cuánto llevas, qué viene y si llegas. */
export function RoadmapCard({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!;
  const total = roadmap.modules.length;
  const percent = total ? Math.round((roadmap.mastered / total) * 100) : 0;
  const active = roadmap.status === "active";
  const checkpoint = nextCheckpoint(checkpoints(roadmap, topic.challenges));
  const pace = paceLabel(roadmap);
  const area = topic.area ?? topic;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Link href={roadmapHref(topic.path)} className="group flex flex-col">
        <div className="relative h-32 overflow-hidden border-b">
          <AreaIllustration
            icon={area.icon}
            className="absolute inset-0 size-full transition-transform duration-(--dur-slow) group-hover:scale-[1.03]"
          />
          <span className="absolute top-3 left-3 flex items-center gap-2 rounded-md border bg-background/80 px-2.5 py-1 text-sm backdrop-blur">
            <span
              className="size-2 rounded-full"
              style={{ background: area.color ?? "var(--primary)" }}
            />
            {area.title}
          </span>
          {roadmap.status !== "active" && (
            <span className="absolute top-3 right-3 rounded-md border bg-background/80 px-2 py-0.5 text-xs text-muted-foreground backdrop-blur">
              {STATUS_TAG[roadmap.status]}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
          <div>
            <h3 className="text-lg font-semibold">{roadmap.title}</h3>
            <p className="text-sm text-muted-foreground">{summary(topic)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-mono">
                {roadmap.mastered} de {total} · {percent} %
              </span>
            </div>
            <Progress
              value={percent}
              className={cn(
                "h-1.5",
                !active && "[&_[data-slot=progress-indicator]]:bg-muted-foreground",
              )}
            />
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Row
              icon={<FlagIcon className="text-warning" />}
              label={checkpoint ? checkpointLabel(checkpoint.challenge) : "Sin retos"}
            >
              {checkpoint?.date ? formatDayMonth(checkpoint.date) : "—"}
            </Row>
            <Row icon={<CalendarIcon className="text-muted-foreground" />} label="Fin estimado">
              {roadmap.plan.finishes && active ? formatDayMonth(roadmap.plan.finishes) : "—"}
            </Row>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
            <Tag dot className={pace.tone}>
              {pace.text}
            </Tag>
            {active && (
              <span className="truncate text-xs text-muted-foreground">{paceDetail(roadmap)}</span>
            )}
          </div>
        </div>
      </Link>
      <NextModuleLink topic={topic} />
    </Card>
  );
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
      {icon}
      <span className="flex-1 truncate">{label}</span>
      <span className="font-mono text-xs text-muted-foreground">{children}</span>
    </div>
  );
}

function NextModuleLink({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!;
  const next = roadmap.current;
  if (!next) {
    return <div className="border-t px-4 py-3 text-sm text-muted-foreground">Ruta terminada</div>;
  }
  return (
    <Link
      href={moduleHref(topic.path, next.name)}
      className={cn(
        "flex items-center justify-between border-t px-4 py-3 text-sm transition-colors duration-(--dur-fast) hover:bg-muted/40",
        roadmap.status === "active" ? "text-primary-text" : "text-muted-foreground",
      )}
    >
      Siguiente: {next.title}
      <ArrowRightIcon className="size-4" />
    </Link>
  );
}

/** «Java · 11 módulos · 5 pistas» */
function summary(topic: TopicSummary): string {
  const roadmap = topic.roadmap!;
  const parts = [topic.title, `${roadmap.modules.length} módulos`];
  if (roadmap.tracks.length > 1) parts.push(`${roadmap.tracks.length} pistas`);
  return parts.join(" · ");
}
