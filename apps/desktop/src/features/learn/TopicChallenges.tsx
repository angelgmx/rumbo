import type { ChallengeSummary, TopicSummary } from "@rumbo/core";
import { ArrowRightIcon, FlagIcon } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NoteReader } from "./NoteReader";
import { Tag } from "./Tag";

/** Pestaña Retos: los proyectos que juntan varios módulos. */
export function TopicChallenges({ topic }: { topic: TopicSummary }) {
  const [reading, setReading] = useState<string>();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">
        Proyectos que juntan varios módulos. Se desbloquean al dominar lo que piden y entran en tu
        portfolio.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {topic.challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.path}
            challenge={challenge}
            color={topic.color}
            onOpen={() => setReading(challenge.path)}
          />
        ))}
      </div>
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </div>
  );
}

interface ChallengeCardProps {
  challenge: ChallengeSummary;
  color?: string;
  onOpen: () => void;
}

function ChallengeCard({ challenge, color, onOpen }: ChallengeCardProps) {
  const { done, total } = challenge.requirements;
  return (
    <button type="button" onClick={onOpen} className="group flex text-left">
      <Card className="w-full gap-4 px-4 transition-shadow duration-(--dur-fast) group-hover:ring-foreground/25">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <FlagIcon className="size-4" />
          </span>
          <div className="min-w-0">
            {challenge.number && (
              <div className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                Reto {challenge.number}
              </div>
            )}
            <div className="truncate text-base font-semibold">{challenge.title}</div>
          </div>
        </div>
        <p className="line-clamp-2 text-muted-foreground">{challenge.summary}</p>
        {challenge.modules.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {challenge.modules.map((module) => (
              <span
                key={module.name}
                className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-0.5 text-xs"
              >
                <span
                  className="size-1.5 rounded-xs"
                  style={{ background: color ?? "var(--primary)" }}
                />
                {module.title}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Requisitos</span>
            <span className="font-mono">
              {done}/{total}
            </span>
          </div>
          <Progress value={total ? (done / total) * 100 : 0} className="h-1" />
        </div>
        <div className="flex items-center justify-between">
          <ChallengeState challenge={challenge} />
          <ArrowRightIcon className="size-4 text-muted-foreground" />
        </div>
      </Card>
    </button>
  );
}

/** Superado, en marcha, desbloqueado o qué falta dominar para desbloquearlo. */
function ChallengeState({ challenge }: { challenge: ChallengeSummary }) {
  const { done, total } = challenge.requirements;
  if (total > 0 && done === total)
    return (
      <Tag dot className="text-success">
        Superado
      </Tag>
    );
  if (done > 0)
    return (
      <Tag dot className="text-primary-text">
        En marcha
      </Tag>
    );

  const missing = challenge.modules
    .filter((module) => module.status !== "mastered")
    .sort((a, b) => b.order - a.order)[0];
  if (!missing) return <Tag className="text-foreground">Desbloqueado</Tag>;
  return <Tag className="text-muted-foreground">Se desbloquea al dominar {missing.title}</Tag>;
}
