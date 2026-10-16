import type { ExerciseLevel, TopicSummary } from "@rumbo/core";
import {
  ArrowRightIcon,
  CalendarIcon,
  CodeIcon,
  FlagIcon,
  LayoutGridIcon,
  RepeatIcon,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LEVEL_STYLE, RESOURCE_STATUS_LABEL, RESOURCE_STATUS_STYLE } from "./moduleStatus";
import { ModuleTable } from "./ModuleTable";
import { NextStepCard } from "./NextStepCard";
import { ResourceIcon } from "./ResourceIcon";
import { reviewMinutes, ReviewDialog, useDueCards, useReview } from "./ReviewDialog";
import { formatSchedule } from "./schedule";
import { Tag } from "./Tag";
import { topicExercises, topicResources } from "./topic";

type Tab = "challenges" | "resources";

/** Pestaña Resumen: cómo vas, la tabla de módulos y lo siguiente. */
export function TopicOverview({
  topic,
  onShowTab,
}: {
  topic: TopicSummary;
  onShowTab: (tab: Tab) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <MasteryStat topic={topic} />
        <ExercisesStat topic={topic} />
        <ReviewStat topic={topic} />
        <RhythmStat topic={topic} />
      </div>
      <div className="grid grid-cols-[1fr_420px] items-start gap-4">
        <ModuleTable topic={topic} />
        <div className="flex flex-col gap-4">
          <NextStepCard topic={topic} />
          {topic.challenges.length > 0 && (
            <ChallengesPreview topic={topic} onShowAll={() => onShowTab("challenges")} />
          )}
          {topicResources(topic).length > 0 && (
            <ResourcesPreview topic={topic} onShowAll={() => onShowTab("resources")} />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-3 px-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <span className="flex-1">{title}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      {children}
    </Card>
  );
}

function Big({ value, rest }: { value: ReactNode; rest: ReactNode }) {
  return (
    <div className="text-3xl font-semibold tracking-tight">
      {value} <span className="text-lg font-normal text-muted-foreground">{rest}</span>
    </div>
  );
}

function MasteryStat({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!;
  const learning = roadmap.modules.filter((module) => module.status === "learning").length;
  return (
    <Stat icon={LayoutGridIcon} title="Dominio de la ruta" hint="Módulos">
      <Big value={roadmap.mastered} rest={`/ ${roadmap.modules.length}`} />
      <p className="text-muted-foreground">
        {learning} en curso · siguiente: {roadmap.current?.title ?? "nada, la terminaste"}
      </p>
      <div className="mt-auto flex gap-1.5">
        {roadmap.modules.map((module) => (
          <span
            key={module.path}
            title={module.title}
            className={cn(
              "h-6 flex-1 rounded-sm bg-muted",
              module.status === "mastered" && "bg-success",
              module.status === "learning" && "bg-primary",
            )}
          />
        ))}
      </div>
    </Stat>
  );
}

function ExercisesStat({ topic }: { topic: TopicSummary }) {
  const exercises = topicExercises(topic);
  const done = exercises.filter((exercise) => exercise.done).length;
  return (
    <Stat icon={CodeIcon} title="Ejercicios" hint="Total">
      <Big value={done} rest={`/ ${exercises.length}`} />
      <p className="text-muted-foreground">Hechos sin mirar la solución</p>
      <Progress
        value={exercises.length ? (done / exercises.length) * 100 : 0}
        className="h-1 [&_[data-slot=progress-indicator]]:bg-success"
      />
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        {([1, 2, 3, 4] as ExerciseLevel[]).map((level) => {
          const ofLevel = exercises.filter((exercise) => exercise.level === level);
          return (
            <span key={level} className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full bg-current", LEVEL_STYLE[level])} />
              <span className="flex-1 text-muted-foreground">Nivel {level}</span>
              <span className="font-mono">
                {ofLevel.filter((exercise) => exercise.done).length}/{ofLevel.length}
              </span>
            </span>
          );
        })}
      </div>
    </Stat>
  );
}

function ReviewStat({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!.title;
  const cards = useDueCards(roadmap);
  const review = useReview(cards.length, roadmap);
  return (
    <Stat icon={RepeatIcon} title="Repaso de hoy" hint="FSRS">
      <Big value={cards.length} rest={cards.length === 1 ? "concepto" : "conceptos"} />
      <p className="text-muted-foreground">
        {cards.length
          ? `Unos ${reviewMinutes(cards.length)} min · repasa antes de seguir`
          : "Nada que repasar hoy"}
      </p>
      {cards.length > 0 && (
        <Button variant="outline" className="mt-auto w-fit" onClick={review.start}>
          <RepeatIcon data-icon="inline-start" />
          Repasar
        </Button>
      )}
      <ReviewDialog {...review.dialog} />
    </Stat>
  );
}

function RhythmStat({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap!;
  const { weeklyMinutes, finishes } = roadmap.plan;
  if (weeklyMinutes === 0) {
    return (
      <Stat icon={CalendarIcon} title="Ritmo" hint="Tu horario">
        <Big value="—" rest="sin horario" />
        <p className="text-muted-foreground">
          Ponle horario a la ruta («schedule» en su nota) para calcular fechas.
        </p>
      </Stat>
    );
  }
  return (
    <Stat icon={CalendarIcon} title="Ritmo" hint="Tu horario">
      <Big value={formatMinutes(weeklyMinutes)} rest="/ semana" />
      <p className="text-muted-foreground">
        {formatSchedule(roadmap.schedule)}
        {finishes ? ` · fin estimado ${formatDayMonth(finishes)}` : " · más de tres años"}
      </p>
    </Stat>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  count,
  footer,
  onShowAll,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  footer: string;
  onShowAll: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Icon className="size-4" />
        <span className="flex-1">{title}</span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="flex flex-col px-2 pb-2">{children}</div>
      <button
        type="button"
        onClick={onShowAll}
        className="flex items-center justify-between border-t px-4 py-3 text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground"
      >
        {footer}
        <ArrowRightIcon className="size-4" />
      </button>
    </Card>
  );
}

function ChallengesPreview({ topic, onShowAll }: { topic: TopicSummary; onShowAll: () => void }) {
  // Primero los que estás haciendo.
  const challenges = [...topic.challenges]
    .sort((a, b) => b.requirements.done - a.requirements.done)
    .slice(0, 3);
  return (
    <PreviewCard
      icon={FlagIcon}
      title="Retos"
      count={topic.challenges.length}
      footer={`Ver los ${topic.challenges.length} retos`}
      onShowAll={onShowAll}
    >
      {challenges.map((challenge) => (
        <div key={challenge.path} className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
            <FlagIcon className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate">{challenge.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {challenge.modules.map((module) => module.title).join(" · ") || challenge.summary}
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {challenge.requirements.done}/{challenge.requirements.total}
          </span>
        </div>
      ))}
    </PreviewCard>
  );
}

function ResourcesPreview({ topic, onShowAll }: { topic: TopicSummary; onShowAll: () => void }) {
  const items = topicResources(topic);
  return (
    <PreviewCard
      icon={LayoutGridIcon}
      title="Recursos"
      count={items.length}
      footer={`Ver los ${items.length} recursos`}
      onShowAll={onShowAll}
    >
      {items.slice(0, 3).map(({ resource }, index) => (
        <div key={`${resource.title}-${index}`} className="flex items-center gap-3 px-2 py-2">
          <ResourceIcon kind={resource.kind} />
          <div className="min-w-0 flex-1">
            <div className="truncate">{resource.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {[resource.source, resource.minutes && formatMinutes(resource.minutes)]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <Tag dot className={RESOURCE_STATUS_STYLE[resource.status]}>
            {RESOURCE_STATUS_LABEL[resource.status]}
          </Tag>
        </div>
      ))}
    </PreviewCard>
  );
}
