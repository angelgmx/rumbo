import { useState } from "react";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { Breadcrumb } from "./Breadcrumb";
import { roadmapCrumbs } from "./crumbs";
import { CompletedSection } from "./home/CompletedSection";
import { NoRoadmaps } from "./home/NoRoadmaps";
import { NowSlot } from "./home/NowSlot";
import { RoadmapFilters } from "./home/RoadmapFilters";
import { RoadmapGrid } from "./home/RoadmapGrid";
import { areaOf, inFilter, sortRoadmaps, type StatusFilter } from "./home/roadmapList";
import { countByStatus } from "./home/summary";
import { TopicsWithoutRoadmap } from "./home/TopicsWithoutRoadmap";

/** Roadmaps: la ruta que toca ahora y todas tus rutas, con su progreso y su ritmo. */
export function RoadmapsScreen() {
  const topics = useVaultQuery((r) => r.learning.topics()).data ?? [];
  const [status, setStatus] = useState<StatusFilter>("all");
  const [area, setArea] = useState<string>();

  const roadmaps = sortRoadmaps(topics.filter((topic) => topic.roadmap));
  const withoutRoadmap = topics.filter((topic) => !topic.roadmap);
  const visible = roadmaps.filter(
    (topic) => inFilter(topic, status) && (!area || areaOf(topic).path === area),
  );
  const finished = visible.filter((topic) => topic.roadmap!.status === "done");
  const listed =
    status === "done" ? finished : visible.filter((topic) => !finished.includes(topic));

  return (
    <>
      <ScreenHeader title={<Breadcrumb items={roadmapCrumbs()} />} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Roadmaps</h1>
            <p className="mt-1 text-muted-foreground">
              {roadmaps.length === 0
                ? "Rutas de aprendizaje con su ritmo"
                : countByStatus(roadmaps)}
            </p>
          </div>

          {roadmaps.length === 0 ? (
            <NoRoadmaps />
          ) : (
            <>
              <NowSlot topics={roadmaps} />
              <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Tus roadmaps</h2>
                <RoadmapFilters
                  topics={roadmaps}
                  status={status}
                  area={area}
                  onStatusChange={setStatus}
                  onAreaChange={setArea}
                />
                {visible.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Ninguna ruta coincide con estos filtros.
                  </p>
                )}
                {listed.length > 0 && <RoadmapGrid topics={listed} />}
              </section>
              {status !== "done" && finished.length > 0 && <CompletedSection topics={finished} />}
            </>
          )}

          {withoutRoadmap.length > 0 && <TopicsWithoutRoadmap topics={withoutRoadmap} />}
        </div>
      </main>
    </>
  );
}
