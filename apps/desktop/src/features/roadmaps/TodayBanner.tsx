import { weekProgress, type TopicSummary } from "@rumbo/core";
import { BookOpenIcon, CalendarIcon, PlayIcon, RepeatIcon } from "lucide-react";
import { Link } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { exerciseTime } from "./ExerciseDetail";
import { moduleHref } from "./links";
import { reviewMinutes, ReviewDialog, useReview } from "./ReviewDialog";
import { formatSchedule } from "./schedule";

/** Lo que toca estudiar ahora, el repaso de hoy y cómo va la semana, en una sola franja. */
export function TodayBanner({ topic, due }: { topic: TopicSummary; due: number }) {
  const roadmap = topic.roadmap!;
  const module = roadmap.current!;
  const exercise = roadmap.nextExercise;

  return (
    <Card className="grid grid-cols-[1.5fr_1fr_1fr] gap-0 divide-x border border-primary/60 bg-linear-to-r from-primary-soft to-card px-0 py-5 ring-0">
      <div className="flex items-center gap-4 px-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-primary-text uppercase">
            <BookOpenIcon className="size-4" />
            Hoy toca
          </span>
          <span className="mt-1 truncate text-xl font-semibold">
            {topic.title} · {module.title}
          </span>
          <span className="truncate text-muted-foreground">
            {exercise
              ? `Ejercicio ${exercise.id} — ${exercise.title} · ${exerciseTime(exercise)}`
              : "Repasa los conceptos y el criterio de dominado"}
          </span>
        </div>
        <Button render={<Link href={moduleHref(topic.path, module.name)} />}>
          <PlayIcon data-icon="inline-start" />
          Continuar
        </Button>
      </div>
      <ReviewColumn due={due} />
      <WeekColumn topic={topic} />
    </Card>
  );
}

function ReviewColumn({ due }: { due: number }) {
  const review = useReview(due);
  return (
    <div className="flex items-center gap-4 px-6">
      <div className="flex flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <RepeatIcon className="size-4 text-muted-foreground" />
          Repaso
        </span>
        <span className="mt-1 text-3xl font-semibold">
          {due}{" "}
          <span className="text-base font-normal text-muted-foreground">
            conceptos · {reviewMinutes(due)} min
          </span>
        </span>
      </div>
      {due > 0 && (
        <Button variant="outline" onClick={review.start}>
          <RepeatIcon data-icon="inline-start" />
          Repasar
        </Button>
      )}
      <ReviewDialog {...review.dialog} />
    </div>
  );
}

/** Cuántas sesiones del hábito de la ruta llevas esta semana. */
function WeekColumn({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  const habit = useVaultQuery(
    (r) => r.habits.list().find((summary) => summary.habit.key === roadmap.habit),
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
          <ProgressRing value={share} color="var(--primary)" size={52} />
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px]">
            {Math.round(share * 100)} %
          </span>
        </span>
        <div>
          <div className="font-medium">
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
