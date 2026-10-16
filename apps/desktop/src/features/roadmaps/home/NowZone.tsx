import { isStalled, type TopicSummary } from "@rumbo/core";
import { ArrowRightIcon, PlayIcon } from "lucide-react";
import { Link } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/features/session/SessionProvider";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { exerciseTime } from "../ExerciseDetail";
import { roadmapHref } from "../links";
import { paceFigures } from "../paceLabels";
import { AdjustPace } from "./AdjustPace";
import { nextStep, type NextStep } from "./nextStep";
import { PaceChip } from "./PaceChip";
import { modulePercent } from "./roadmapList";
import { StalledNotice } from "./StalledNotice";
import { Stat } from "./Stat";

/** «Ahora»: la ruta que toca, su siguiente paso concreto, si llegas y cómo empezar. */
export function NowZone({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const session = useSession();
  const roadmap = topic.roadmap!;
  const step = nextStep(topic)!;
  const percent = modulePercent(roadmap);
  const pace = paceFigures(roadmap);
  const stalled = isStalled(roadmap.lastActivity, rumbo.daily.today());

  return (
    <section className="flex flex-col gap-3">
      {stalled && <StalledNotice topic={topic} />}
      <Card className="gap-5 border-primary/60 bg-linear-to-br from-primary-soft to-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium tracking-widest text-primary-text uppercase">
              Ahora
            </p>
            <h2 className="mt-2 truncate text-xl font-semibold tracking-tight">{roadmap.title}</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {topic.area ? `${topic.area.title} › ${topic.title}` : topic.title}
            </p>
          </div>
          <PaceChip roadmap={roadmap} />
        </div>

        <div className="flex items-center gap-3">
          <Progress value={percent} className="h-1.5 flex-1" />
          <span className="font-mono text-sm text-muted-foreground">
            {roadmap.mastered} de {roadmap.modules.length} · {percent} %
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 border-t pt-4">
          <Stat
            label="Siguiente paso"
            value={`Módulo ${step.position} · ${step.module.title}`}
            hint={stepHint(step)}
          />
          <Stat
            label="Ritmo"
            value={`Tu horario: ${pace.planned}`}
            hint={pace.needed ?? "Sin fecha objetivo"}
          />
          <Stat
            label="Te quedan"
            value={formatMinutes(roadmap.plan.remainingMinutes)}
            hint={roadmap.plan.finishes && `Terminas el ${formatDayMonth(roadmap.plan.finishes)}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => session.start(step.request())}>
            <PlayIcon data-icon="inline-start" />
            Empezar ahora
          </Button>
          <Button variant="outline" render={<Link href={roadmapHref(topic.path)} />}>
            Ver roadmap
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <AdjustPace roadmap={roadmap} />
        </div>
      </Card>
    </section>
  );
}

/** «Ejercicio 02 — Bucles · 25 min · Curso: Platzi» */
function stepHint(step: NextStep): string {
  const { exercise, resource } = step;
  const work = exercise
    ? `Ejercicio ${exercise.id} — ${exercise.title} · ${exerciseTime(exercise)}`
    : "Repasar conceptos y criterio de dominado";
  return resource ? `${work} · ${resource.title}` : work;
}
