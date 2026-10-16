import type { TopicSummary } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "wouter";
import { AreaIcon } from "@/components/AreaIcon";
import { Card } from "@/components/ui/card";
import { topicHref } from "../links";
import { noteCount } from "../topic";

/** Temas con apuntes pero sin ruta: se leen desde aquí hasta que exista la página de Áreas. */
export function TopicsWithoutRoadmap({ topics }: { topics: TopicSummary[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Temas sin ruta</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
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
