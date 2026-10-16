import { startOfWeek, type ModuleSummary, type TopicSummary } from "@rumbo/core";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDayMonth } from "@/lib/format";
import { moduleHref } from "./links";
import { STATUS_LABEL, STATUS_STYLE } from "./moduleStatus";
import { NoteReader } from "./NoteReader";
import { RoadmapDiagram } from "./RoadmapDiagram";
import { RoadmapLegend } from "./RoadmapLegend";
import { Tag } from "./Tag";

type View = "diagram" | "weeks";

/** Pestaña Ruta: el diagrama tipo roadmap.sh o la lista por semanas. */
export function TopicRoadmap({ topic }: { topic: TopicSummary }) {
  const [view, setView] = useState<View>("diagram");
  const [reading, setReading] = useState<string>();
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <RoadmapLegend />
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[view]}
          onValueChange={(values) => values[0] && setView(values[0] as View)}
        >
          <ToggleGroupItem value="diagram">Diagrama</ToggleGroupItem>
          <ToggleGroupItem value="weeks">Por semanas</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {view === "diagram" ? (
        <RoadmapDiagram
          topic={topic}
          className="h-[640px] overflow-hidden rounded-xl border"
          onSelectModule={(module) => navigate(moduleHref(topic.path, module.name))}
          onOpenChallenge={setReading}
        />
      ) : (
        <WeeksList topic={topic} />
      )}
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </div>
  );
}

/** Los módulos agrupados por la semana en que terminarías cada uno, según tu horario. */
export function WeeksList({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!;
  const groups = new Map<string, ModuleSummary[]>();
  for (const module of roadmap.modules) {
    const finishes = roadmap.plan.modules.get(module.path);
    const key =
      module.status === "mastered" || module.status === "skipped"
        ? "Hecho"
        : finishes
          ? `Semana del ${formatDayMonth(startOfWeek(finishes))}`
          : "Sin fecha";
    groups.set(key, [...(groups.get(key) ?? []), module]);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([week, modules]) => (
        <Card key={week} className="gap-0 py-0">
          <div className="border-b px-4 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {week}
          </div>
          {modules.map((module) => {
            const finishes = roadmap.plan.modules.get(module.path);
            return (
              <Link
                key={module.path}
                href={moduleHref(topic.path, module.name)}
                className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0 hover:bg-muted/40"
              >
                <span className="flex-1">
                  {String(module.order).padStart(2, "0")} · {module.title}
                </span>
                {finishes && module.status !== "mastered" && (
                  <span className="font-mono text-xs text-muted-foreground">
                    ≈ {formatDayMonth(finishes)}
                  </span>
                )}
                <Tag dot className={STATUS_STYLE[module.status]}>
                  {STATUS_LABEL[module.status]}
                </Tag>
              </Link>
            );
          })}
        </Card>
      ))}
    </div>
  );
}
