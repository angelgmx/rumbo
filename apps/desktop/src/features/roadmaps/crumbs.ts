import type { TopicSummary } from "@rumbo/core";
import type { Crumb } from "./Breadcrumb";
import { roadmapHref } from "./links";

const ROADMAPS: Crumb = { label: "Roadmaps", href: "/roadmaps" };

/** Áreas › Desarrollo › Java. Áreas aún no tiene página: va sin enlace. */
export function topicCrumbs(topic?: TopicSummary): Crumb[] {
  if (!topic) return [{ label: "Áreas" }];
  return [
    { label: "Áreas" },
    ...(topic.area ? [{ label: topic.area.title }] : []),
    { label: topic.title },
  ];
}

/** Roadmaps › Java desde cero › Bucles */
export function roadmapCrumbs(topic?: TopicSummary, module?: string): Crumb[] {
  const roadmap = topic?.roadmap;
  return [
    ROADMAPS,
    ...(topic && roadmap ? [{ label: roadmap.title, href: roadmapHref(topic.path) }] : []),
    ...(module ? [{ label: module }] : []),
  ];
}
