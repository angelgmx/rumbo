import { weekProgress, type AreaRef, type TopicSummary } from "@rumbo/core";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  GraduationCapIcon,
  PlayIcon,
  PlusIcon,
  RepeatIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { AreaIllustration } from "@/components/AreaIllustration";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { cn } from "@/lib/utils";
import { exerciseTime } from "./ExerciseDetail";
import { moduleHref, topicHref } from "./links";
import { reviewMinutes, ReviewDialog, useDueCards, useReview } from "./ReviewDialog";
import { formatSchedule } from "./schedule";
import { noteCount } from "./topic";

type View = "areas" | "roadmaps";

/** Roadmaps: lo que toca hoy y todos tus temas, agrupados por área. */
export function RoadmapsScreen() {
  const topics = useVaultQuery((r) => r.learning.topics()).data ?? [];
  const due = useDueCards();
  const [view, setView] = useState<View>("areas");
  const active = topics.filter((topic) => topic.roadmap?.current);
  const current = active[0];

  return (
    <>
      <ScreenHeader title="Roadmaps" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Roadmaps</h1>
            <p className="mt-1 text-muted-foreground">
              {active.length} {active.length === 1 ? "ruta en marcha" : "rutas en marcha"} ·{" "}
              {due.length} conceptos para repasar hoy
            </p>
          </div>

          {topics.length === 0 ? (
            <NoTopics />
          ) : (
            <>
              {current && <TodayBanner topic={current} due={due.length} />}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Lo que estás aprendiendo</h2>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  value={[view]}
                  onValueChange={(values) => values[0] && setView(values[0] as View)}
                >
                  <ToggleGroupItem value="areas">Por área</ToggleGroupItem>
                  <ToggleGroupItem value="roadmaps">Rutas</ToggleGroupItem>
                </ToggleGroup>
              </div>
              {view === "areas" ? (
                <TopicsByArea topics={topics} />
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {topics
                    .filter((topic) => topic.roadmap)
                    .map((topic) => (
                      <TopicCard key={topic.path} topic={topic} />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

function NoTopics() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GraduationCapIcon />
        </EmptyMedia>
        <EmptyTitle>Todavía no tienes temas</EmptyTitle>
        <EmptyDescription>
          Un tema es un área con una carpeta «Apuntes» o con una ruta («type: roadmap») y sus
          módulos («type: module»).
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/** Lo que toca estudiar ahora, el repaso de hoy y cómo va la semana, en una sola franja. */
function TodayBanner({ topic, due }: { topic: TopicSummary; due: number }) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  const module = roadmap.current!;
  const exercise = roadmap.nextExercise;
  const review = useReview(due);

  async function addToToday() {
    const text = await rumbo.learning.planToday(roadmap);
    if (text) toast.success("Añadido a hoy", { description: text });
  }

  return (
    <Card className="grid grid-cols-[1.4fr_1fr_1fr] gap-0 divide-x border border-primary/60 bg-linear-to-r from-primary-soft to-card px-0 py-5 ring-0">
      <div className="flex flex-col gap-1 px-5">
        <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-primary-text uppercase">
          <BookOpenIcon className="size-4" />
          Hoy toca
        </span>
        <span className="mt-1 text-xl font-semibold">
          {topic.title} · {module.title}
        </span>
        <span className="text-muted-foreground">
          {exercise
            ? `Ejercicio ${exercise.id} — ${exercise.title} · nivel ${exercise.level} · ${exerciseTime(exercise)}`
            : "Repasa los conceptos y el criterio de dominado"}
        </span>
        <div className="mt-3 flex gap-2">
          <Button render={<Link href={moduleHref(topic.path, module.name)} />}>
            <PlayIcon data-icon="inline-start" />
            Continuar
          </Button>
          <Button variant="outline" onClick={addToToday}>
            <PlusIcon data-icon="inline-start" />
            Añadir a hoy
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-6">
        <span className="flex items-center gap-2">
          <RepeatIcon className="size-4 text-muted-foreground" />
          Repaso de hoy
        </span>
        <span className="mt-1 text-3xl font-semibold">
          {due}{" "}
          <span className="text-base font-normal text-muted-foreground">
            conceptos · {reviewMinutes(due)} min
          </span>
        </span>
        {due > 0 && (
          <Button variant="outline" className="mt-auto w-fit" onClick={review.start}>
            <RepeatIcon data-icon="inline-start" />
            Repasar
          </Button>
        )}
        <ReviewDialog {...review.dialog} />
      </div>
      <WeekColumn topic={topic} />
    </Card>
  );
}

/** Cuántas sesiones del hábito de la ruta llevas esta semana. */
function WeekColumn({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  const habit = useVaultQuery(
    (r) => r.habits.list().habits.find((summary) => summary.habit.key === roadmap.habit),
    [roadmap.habit],
  ).data;
  const week = habit ? weekProgress(habit.habit, habit.history, rumbo.daily.today()) : undefined;
  const share = week?.due ? week.done / week.due : 0;

  return (
    <div className="flex flex-col gap-3 px-6">
      <span className="flex items-center gap-2">
        <CalendarIcon className="size-4 text-muted-foreground" />
        Esta semana
      </span>
      <div className="flex items-center gap-4">
        <span className="relative flex">
          <ProgressRing value={share} color="var(--primary)" size={60} />
          <span className="absolute inset-0 flex items-center justify-center font-mono text-xs">
            {Math.round(share * 100)} %
          </span>
        </span>
        <div>
          <div className="text-base font-medium">
            {week ? `${week.done} de ${week.due} sesiones` : "Sin hábito de estudio"}
          </div>
          <div className="text-sm text-muted-foreground">
            {roadmap.schedule.length ? formatSchedule(roadmap.schedule) : "sin horario"}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Una fila por área: su ilustración y sus temas. Un tema sin área va solo. */
function TopicsByArea({ topics }: { topics: TopicSummary[] }) {
  const groups = new Map<string, { area: AreaRef; topics: TopicSummary[] }>();
  for (const topic of topics) {
    const area = topic.area ?? topic;
    const group = groups.get(area.path) ?? { area, topics: [] };
    group.topics.push(topic);
    groups.set(area.path, group);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.values()].map(({ area, topics: ofArea }) => (
        <div key={area.path} className="grid grid-cols-[260px_1fr] gap-4">
          <div className="relative min-h-52 overflow-hidden rounded-xl border bg-card">
            <AreaIllustration icon={area.icon} className="absolute inset-0 size-full" />
            <span className="absolute top-3 left-3 flex items-center gap-2 rounded-md border bg-background/80 px-2.5 py-1 text-sm backdrop-blur">
              <span
                className="size-2 rounded-full"
                style={{ background: area.color ?? "var(--primary)" }}
              />
              {area.title}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {ofArea.map((topic) => (
              <TopicCard key={topic.path} topic={topic} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicCard({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap;
  const concepts = (roadmap?.modules ?? []).flatMap((module) => module.content.concepts);
  const mastery = concepts.length
    ? Math.round((concepts.filter((concept) => concept.done).length / concepts.length) * 100)
    : 0;

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center gap-3 px-4 pt-4">
        <AreaIcon
          area={{ icon: topic.icon, color: topic.color ?? "var(--muted-foreground)" }}
          className="size-9"
        />
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{topic.title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {roadmap
              ? `Ruta «${roadmap.title}» · ${mastery} %`
              : `${noteCount(topic)} apuntes · sin ruta`}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        {roadmap ? (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dominio</span>
              <span className="font-mono text-foreground">{mastery} %</span>
            </div>
            <Progress value={mastery} className="h-1.5" />
            <span className="mt-2 flex items-center gap-2 text-sm">
              <ArrowRightIcon className="size-4 text-primary-text" />
              {roadmap.current ? `Siguiente: ${roadmap.current.title}` : "Ruta terminada"}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            Tus apuntes de {topic.title}, listos para leer y repasar.
          </span>
        )}
      </div>
      <Link
        href={topicHref(topic.path)}
        className={cn(
          "flex items-center justify-between border-t px-4 py-3 text-sm transition-colors duration-(--dur-fast) hover:bg-muted/40",
          roadmap ? "text-primary-text" : "text-muted-foreground",
        )}
      >
        Abrir
        <ArrowRightIcon className="size-4" />
      </Link>
    </Card>
  );
}
