import type { TopicSummary } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { formatDayMonth } from "@/lib/format";
import { Breadcrumb } from "./Breadcrumb";
import { STATUS_LABEL, STATUS_STYLE } from "./moduleStatus";
import { ObsidianButton } from "./ObsidianButton";
import { PageTitle } from "./PageTitle";
import { Tag } from "./Tag";
import { noteCount, topicExercises, topicResources, topicStatus } from "./topic";
import { TopicChallenges } from "./TopicChallenges";
import { TopicExercises } from "./TopicExercises";
import { TopicNotes } from "./TopicNotes";
import { TopicOverview } from "./TopicOverview";
import { TopicResources } from "./TopicResources";
import { TopicRoadmap } from "./TopicRoadmap";

type TabId = "summary" | "roadmap" | "notes" | "exercises" | "challenges" | "resources";

/** Un tema (Java) con sus pestañas. Solo salen las que tienen algo. */
export function TopicScreen() {
  const path = decodeURIComponent(useParams<{ topic: string }>().topic ?? "");
  const topic = useVaultQuery((r) => r.learning.topic(path), [path]).data;

  if (!topic) {
    return (
      <>
        <ScreenHeader title={<Breadcrumb />} />
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No encuentro este tema</EmptyTitle>
            <EmptyDescription>Puede que la nota se haya movido o renombrado.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );
  }
  // La key hace que al cambiar de tema se vuelva a la primera pestaña.
  return <Topic key={topic.path} topic={topic} />;
}

function Topic({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const tabs = availableTabs(topic);
  const [tab, setTab] = useState<TabId>(tabs[0]!.id);
  const status = topicStatus(topic);
  const roadmap = topic.roadmap;

  async function addToToday() {
    if (!roadmap) return;
    const text = await rumbo.learning.planToday(roadmap);
    if (text) toast.success("Añadido a hoy", { description: text });
  }

  return (
    <>
      <ScreenHeader
        title={<Breadcrumb topic={topic} />}
        actions={
          <>
            <ObsidianButton path={topic.path} />
            {tab === "summary" && roadmap?.current && (
              <Button variant="outline" onClick={addToToday}>
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
            title={topic.title}
            subtitle={subtitle(topic)}
            aside={
              status && (
                <Tag dot className={STATUS_STYLE[status]}>
                  {STATUS_LABEL[status]}
                </Tag>
              )
            }
          />
          <Tabs value={tab} onValueChange={(value) => setTab(value as TabId)}>
            <TabsList variant="line" className="h-10 w-full justify-start gap-5 border-b">
              {tabs.map(({ id, label, count }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex-none px-0 text-sm after:bg-primary"
                >
                  {label}
                  {count !== undefined && (
                    <span className="rounded bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-4">
              {roadmap && (
                <TabsContent value="summary">
                  <TopicOverview topic={topic} onShowTab={setTab} />
                </TabsContent>
              )}
              {roadmap && (
                <TabsContent value="roadmap">
                  <TopicRoadmap topic={topic} />
                </TabsContent>
              )}
              <TabsContent value="notes">
                <TopicNotes topic={topic} />
              </TabsContent>
              <TabsContent value="exercises">
                <TopicExercises topic={topic} />
              </TabsContent>
              <TabsContent value="challenges">
                <TopicChallenges topic={topic} />
              </TabsContent>
              <TabsContent value="resources">
                <TopicResources topic={topic} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </>
  );
}

function availableTabs(topic: TopicSummary) {
  const tabs: { id: TabId; label: string; count?: number; show: boolean }[] = [
    { id: "summary", label: "Resumen", show: Boolean(topic.roadmap) },
    { id: "roadmap", label: "Ruta", show: Boolean(topic.roadmap) },
    { id: "notes", label: "Apuntes", count: noteCount(topic), show: noteCount(topic) > 0 },
    {
      id: "exercises",
      label: "Ejercicios",
      count: topicExercises(topic).length,
      show: topicExercises(topic).length > 0,
    },
    {
      id: "challenges",
      label: "Retos",
      count: topic.challenges.length,
      show: topic.challenges.length > 0,
    },
    // Recursos siempre: desde aquí se añade el primero.
    { id: "resources", label: "Recursos", count: topicResources(topic).length, show: true },
  ];
  return tabs.filter((tab) => tab.show);
}

function subtitle(topic: TopicSummary): string {
  const parts = [topic.area ? `Tema de ${topic.area.title}` : "Tema"];
  const roadmap = topic.roadmap;
  if (!roadmap) return [...parts, `${noteCount(topic)} apuntes`, "sin ruta"].join(" · ");

  parts.push(
    `ruta «${roadmap.title}»`,
    `${roadmap.mastered} de ${roadmap.modules.length} módulos dominados`,
  );
  if (roadmap.plan.finishes) parts.push(`la terminas ≈ ${formatDayMonth(roadmap.plan.finishes)}`);
  return parts.join(" · ");
}
