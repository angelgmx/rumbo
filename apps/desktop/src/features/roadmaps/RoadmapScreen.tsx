import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { InlineTitle } from "@/components/InlineTitle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { formatDayMonth } from "@/lib/format";
import { Breadcrumb } from "./Breadcrumb";
import { roadmapCrumbs, topicCrumbs } from "./crumbs";
import { topicHref } from "./links";
import { ModulePanel } from "./ModulePanel";
import { NoteReader } from "./NoteReader";
import { ObsidianButton } from "./ObsidianButton";
import { PaceCard } from "./PaceCard";
import { PageTitle } from "./PageTitle";
import { RoadmapMenu } from "./RoadmapMenu";
import { RoadmapDiagram } from "./RoadmapDiagram";
import { RoadmapLegend } from "./RoadmapLegend";
import { WeeksList } from "./TopicRoadmap";

type View = "diagram" | "weeks";

/** Una ruta abierta: pistas en paralelo, el módulo que eliges y si llegas a tu fecha. */
export function RoadmapScreen() {
  const path = decodeURIComponent(useParams<{ topic: string }>().topic ?? "");
  const topic = useVaultQuery((r) => r.learning.topic(path), [path]).data;

  if (!topic?.roadmap) {
    return (
      <>
        <ScreenHeader title={<Breadcrumb items={roadmapCrumbs()} />} />
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No encuentro esta ruta</EmptyTitle>
            <EmptyDescription>Puede que la nota se haya movido o renombrado.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );
  }
  // La key hace que al cambiar de ruta se vuelva a elegir el módulo actual.
  return <Roadmap key={topic.path} topic={topic} />;
}

function Roadmap({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  const [view, setView] = useState<View>("diagram");
  const [selectedPath, setSelectedPath] = useState(roadmap.current?.path);
  const [reading, setReading] = useState<string>();
  const selected: ModuleSummary | undefined =
    roadmap.modules.find((module) => module.path === selectedPath) ?? roadmap.modules[0];
  const percent = roadmap.modules.length
    ? Math.round((roadmap.mastered / roadmap.modules.length) * 100)
    : 0;

  async function addToToday() {
    const text = await rumbo.learning.planToday(roadmap);
    if (text) toast.success("Añadido a hoy", { description: text });
  }

  return (
    <>
      <ScreenHeader
        title={<Breadcrumb items={roadmapCrumbs(topic)} />}
        actions={
          <>
            <ObsidianButton path={roadmap.path} />
            <RoadmapMenu roadmap={roadmap} />
            {roadmap.current && (
              <Button onClick={addToToday}>
                <PlusIcon data-icon="inline-start" />
                Añadir a hoy
              </Button>
            )}
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <PageTitle
            backHref="/roadmaps"
            icon={topic}
            title={
              <InlineTitle
                label="Nombre de la ruta"
                value={roadmap.title}
                onSave={(title) => rumbo.roadmaps.rename(roadmap, title)}
                className="-mx-1 px-1"
              />
            }
            subtitle={<Subtitle topic={topic} />}
            aside={
              <div className="flex w-44 flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {roadmap.mastered} de {roadmap.modules.length}
                  </span>
                  <span className="font-mono text-muted-foreground">{percent} %</span>
                </div>
                <span className="h-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full bg-primary" style={{ width: `${percent}%` }} />
                </span>
              </div>
            }
          />
          <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-4">
            <div className="flex flex-col gap-4">
              <Card className="gap-0 py-0">
                <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
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
                    selected={selected?.path}
                    className="h-[calc(100dvh-14rem)] min-h-[540px]"
                    onSelectModule={(module) => setSelectedPath(module.path)}
                    onOpenChallenge={setReading}
                  />
                ) : (
                  <div className="p-4">
                    <WeeksList topic={topic} />
                  </div>
                )}
              </Card>
              {roadmap.status === "active" && <PaceCard roadmap={roadmap} />}
            </div>
            {selected && <ModulePanel topic={topic} module={selected} onOpenNote={setReading} />}
          </div>
        </div>
      </main>
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </>
  );
}

/** «Áreas › Desarrollo › Java · 11 módulos en 4 pistas · fin estimado 8 ene» */
function Subtitle({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!;
  const parts = [
    roadmap.tracks.length > 1
      ? `${roadmap.modules.length} módulos en ${roadmap.tracks.length} pistas`
      : `${roadmap.modules.length} módulos`,
  ];
  if (roadmap.plan.finishes) parts.push(`fin estimado ${formatDayMonth(roadmap.plan.finishes)}`);

  return (
    <>
      <Link href={topicHref(topic.path)} className="hover:text-foreground">
        {topicCrumbs(topic)
          .map((crumb) => crumb.label)
          .join(" › ")}
      </Link>
      {` · ${parts.join(" · ")}`}
    </>
  );
}
