import type { ExerciseLevel, TopicSummary } from "@rumbo/core";
import { CodeIcon } from "lucide-react";
import { useState } from "react";
import { OptionSelect } from "@/components/OptionSelect";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LEVEL_NAME } from "@/features/roadmaps/moduleStatus";
import { NoteReader } from "@/features/roadmaps/NoteReader";
import { ChallengeCard } from "@/features/roadmaps/TopicChallenges";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { cn } from "@/lib/utils";
import { ExerciseCard } from "./ExerciseCard";
import { exerciseItems, levelsOf, type ExerciseItem } from "./exerciseItems";

type Filter = "all" | "pending" | "challenges" | `level-${ExerciseLevel}`;

const LEVEL_DOT: Record<ExerciseLevel, string> = {
  1: "bg-success",
  2: "bg-warning",
  3: "bg-destructive",
  4: "bg-muted-foreground",
};

/** Ejercicios: todos los de un tema por niveles, y sus retos, para elegir qué practicar. */
export function ExercisesScreen() {
  const topics = (useVaultQuery((r) => r.learning.topics()).data ?? []).filter(
    (topic) => exerciseItems(topic).length > 0 || topic.challenges.length > 0,
  );
  const [topicPath, setTopicPath] = useState<string>();
  const topic =
    topics.find((candidate) => candidate.path === topicPath) ??
    topics.find((candidate) => candidate.roadmap?.current) ??
    topics[0];

  return (
    <>
      <ScreenHeader title="Ejercicios" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          {topic ? (
            <TopicExercisesGallery
              key={topic.path}
              topic={topic}
              topics={topics}
              onTopicChange={setTopicPath}
            />
          ) : (
            <NoExercises />
          )}
        </div>
      </main>
    </>
  );
}

interface GalleryProps {
  topic: TopicSummary;
  topics: TopicSummary[];
  onTopicChange: (path: string) => void;
}

function TopicExercisesGallery({ topic, topics, onTopicChange }: GalleryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [modulePath, setModulePath] = useState<string | null>(null);
  const [reading, setReading] = useState<string>();

  const all = exerciseItems(topic);
  const ofModule = all.filter((item) => modulePath === null || item.module.path === modulePath);
  const levels = levelsOf(all);
  const visible = ofModule.filter((item) => matches(item, filter));
  const showChallenges =
    (filter === "all" || filter === "challenges") && topic.challenges.length > 0;
  const modules = (topic.roadmap?.modules ?? []).filter((module) => module.exercises.length > 0);

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ejercicios</h1>
        <p className="mt-1 text-muted-foreground">{summary(topic, all)}</p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[filter]}
          onValueChange={(values) => values[0] && setFilter(values[0] as Filter)}
        >
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
          {levels.map((level) => (
            <ToggleGroupItem key={level} value={`level-${level}`}>
              Nivel {level}
            </ToggleGroupItem>
          ))}
          <ToggleGroupItem value="pending">Pendientes</ToggleGroupItem>
          {topic.challenges.length > 0 && (
            <ToggleGroupItem value="challenges">Retos</ToggleGroupItem>
          )}
        </ToggleGroup>
        <div className="flex gap-2">
          {topics.length > 1 && (
            <div className="w-48">
              <OptionSelect
                options={topics.map((option) => ({
                  label: `Tema: ${option.title}`,
                  value: option.path,
                }))}
                value={topic.path}
                onChange={(value) => value && onTopicChange(value)}
              />
            </div>
          )}
          <div className="w-56">
            <OptionSelect
              options={[
                { label: "Módulo: Todos", value: null },
                ...modules.map((module) => ({
                  label: `Módulo: ${module.title}`,
                  value: module.path,
                })),
              ]}
              value={modulePath}
              onChange={setModulePath}
            />
          </div>
        </div>
      </div>

      {filter !== "challenges" &&
        levels.map((level) => (
          <LevelSection
            key={level}
            level={level}
            items={visible.filter((item) => item.exercise.level === level)}
            total={ofModule.filter((item) => item.exercise.level === level)}
          />
        ))}
      {filter !== "challenges" && visible.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">Nada por aquí con estos filtros.</p>
      )}

      {showChallenges && (
        <section className="flex flex-col gap-3">
          <SectionTitle
            dot="bg-foreground"
            title="Retos"
            detail={`${topic.challenges.filter((c) => c.requirements.done > 0).length} de ${topic.challenges.length} empezados`}
          />
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
        </section>
      )}
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </>
  );
}

function LevelSection({
  level,
  items,
  total,
}: {
  level: ExerciseLevel;
  items: ExerciseItem[];
  total: ExerciseItem[];
}) {
  if (items.length === 0) return null;
  const name = items[0]!.exercise.levelName || LEVEL_NAME[level];
  const done = total.filter((item) => item.exercise.done).length;
  return (
    <section className="flex flex-col gap-3">
      <SectionTitle
        dot={LEVEL_DOT[level]}
        title={`Nivel ${level} · ${name}`}
        detail={`${done} de ${total.length}`}
      />
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <ExerciseCard key={`${item.module.path}-${item.exercise.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ dot, title, detail }: { dot: string; title: string; detail: string }) {
  return (
    <h2 className="flex items-center gap-2 font-semibold">
      <span className={cn("size-2 rounded-xs", dot)} />
      {title}
      <span className="font-mono text-sm font-normal text-muted-foreground">{detail}</span>
    </h2>
  );
}

function matches(item: ExerciseItem, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "pending") return !item.exercise.done;
  if (filter === "challenges") return false;
  return `level-${item.exercise.level}` === filter;
}

/** «Java · 70 ejercicios y 6 retos · 3 resueltos» */
function summary(topic: TopicSummary, items: ExerciseItem[]): string {
  const done = items.filter((item) => item.exercise.done).length;
  const challenges = topic.challenges.length;
  const what = challenges
    ? `${items.length} ejercicios y ${challenges} retos`
    : `${items.length} ejercicios`;
  return `${topic.title} · ${what} · ${done} resueltos`;
}

function NoExercises() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CodeIcon />
        </EmptyMedia>
        <EmptyTitle>Todavía no hay ejercicios</EmptyTitle>
        <EmptyDescription>
          Los ejercicios salen de la carpeta «Ejercicios» de cada tema: una nota por módulo, con «##
          Nivel 1» y «### 01 — Título».
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
