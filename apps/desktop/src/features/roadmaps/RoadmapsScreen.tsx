import type { RoadmapStatus, TopicSummary } from "@rumbo/core";
import { ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { AreaIcon } from "@/components/AreaIcon";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { topicHref } from "./links";
import { useDueCards } from "./ReviewDialog";
import { RoadmapCard } from "./RoadmapCard";
import { TodayBanner } from "./TodayBanner";
import { noteCount } from "./topic";

const ALL = "all";
// Primero lo que estás haciendo; lo pausado y lo terminado, al final.
const STATUS_ORDER: RoadmapStatus[] = ["active", "planned", "paused", "done"];

/** Roadmaps: lo que toca hoy y todas tus rutas, con su progreso y su ritmo. */
export function RoadmapsScreen() {
  const topics = useVaultQuery((r) => r.learning.topics()).data ?? [];
  const due = useDueCards();
  const [area, setArea] = useState(ALL);

  const withRoadmap = sortByWhatComesFirst(topics.filter((topic) => topic.roadmap));
  const visible = withRoadmap.filter((topic) => area === ALL || areaOf(topic).path === area);
  const current = withRoadmap.find(
    (topic) => topic.roadmap!.status === "active" && topic.roadmap!.current,
  );
  const withoutRoadmap = topics.filter((topic) => !topic.roadmap);

  return (
    <>
      <ScreenHeader title="Roadmaps" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Roadmaps</h1>
              <p className="mt-1 text-muted-foreground">{countByStatus(withRoadmap)}</p>
            </div>
            <AreaFilter topics={withRoadmap} value={area} onChange={setArea} />
          </div>

          {withRoadmap.length === 0 ? (
            <NoRoadmaps />
          ) : (
            <>
              {current && <TodayBanner topic={current} due={due.length} />}
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Tus rutas</h2>
                <span className="text-sm text-muted-foreground">
                  Ordenadas por lo que toca antes
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {visible.map((topic) => (
                  <RoadmapCard key={topic.path} topic={topic} />
                ))}
              </div>
            </>
          )}

          {withoutRoadmap.length > 0 && <TopicsWithoutRoadmap topics={withoutRoadmap} />}
        </div>
      </main>
    </>
  );
}

function AreaFilter({
  topics,
  value,
  onChange,
}: {
  topics: TopicSummary[];
  value: string;
  onChange: (area: string) => void;
}) {
  const areas = [...new Map(topics.map((topic) => [areaOf(topic).path, areaOf(topic)])).values()];
  if (areas.length < 2) return null;
  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      value={[value]}
      onValueChange={(values) => values[0] && onChange(values[0])}
    >
      <ToggleGroupItem value={ALL}>Todas</ToggleGroupItem>
      {areas.map((option) => (
        <ToggleGroupItem key={option.path} value={option.path}>
          {option.title}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** Temas con apuntes pero sin ruta: se leen desde aquí hasta que exista la página de Áreas. */
function TopicsWithoutRoadmap({ topics }: { topics: TopicSummary[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Temas sin ruta</h2>
      <div className="grid grid-cols-4 gap-3">
        {topics.map((topic) => (
          <Link key={topic.path} href={topicHref(topic.path)} className="group">
            <Card className="flex-row items-center gap-3 px-4 py-3 transition-shadow duration-(--dur-fast) group-hover:ring-foreground/25">
              <AreaIcon
                area={{ icon: topic.icon, color: topic.color ?? "var(--muted-foreground)" }}
                className="size-9"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{topic.title}</div>
                <div className="text-xs text-muted-foreground">{noteCount(topic)} apuntes</div>
              </div>
              <ArrowRightIcon className="size-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NoRoadmaps() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpenIcon />
        </EmptyMedia>
        <EmptyTitle>Todavía no tienes rutas</EmptyTitle>
        <EmptyDescription>
          Una ruta es una nota «type: roadmap» y sus módulos son notas «type: module» que dicen a
          qué ruta pertenecen.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function areaOf(topic: TopicSummary) {
  return topic.area ?? topic;
}

/** Por estado y, dentro de cada estado, la que antes termina su módulo actual. */
function sortByWhatComesFirst(topics: TopicSummary[]): TopicSummary[] {
  const nextDate = (topic: TopicSummary) => {
    const roadmap = topic.roadmap!;
    return (roadmap.current && roadmap.plan.modules.get(roadmap.current.path)) ?? "9999";
  };
  return [...topics].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.roadmap!.status) - STATUS_ORDER.indexOf(b.roadmap!.status) ||
      nextDate(a).localeCompare(nextDate(b)),
  );
}

/** «3 rutas activas · 1 planificada · 1 pausada» */
function countByStatus(topics: TopicSummary[]): string {
  const words: Record<RoadmapStatus, [string, string]> = {
    active: ["ruta activa", "rutas activas"],
    planned: ["planificada", "planificadas"],
    paused: ["pausada", "pausadas"],
    done: ["terminada", "terminadas"],
  };
  return STATUS_ORDER.flatMap((status) => {
    const count = topics.filter((topic) => topic.roadmap!.status === status).length;
    return count ? [`${count} ${words[status][count === 1 ? 0 : 1]}`] : [];
  }).join(" · ");
}
