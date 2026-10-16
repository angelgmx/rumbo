import type { TopicSummary } from "@rumbo/core";
import { Link } from "wouter";
import { topicHref } from "./links";

/** Aprender › Desarrollo › Java › Bucles, con enlace en lo que se puede abrir. */
export function Breadcrumb({ topic, module }: { topic?: TopicSummary; module?: string }) {
  return (
    <span className="text-muted-foreground">
      <Link href="/aprender">Aprender</Link>
      {topic?.area && <> › {topic.area.title}</>}
      {topic && (
        <>
          {" › "}
          {module ? (
            <Link href={topicHref(topic.path)}>{topic.title}</Link>
          ) : (
            <span className="text-foreground">{topic.title}</span>
          )}
        </>
      )}
      {module && (
        <>
          {" › "}
          <span className="text-foreground">{module}</span>
        </>
      )}
    </span>
  );
}
