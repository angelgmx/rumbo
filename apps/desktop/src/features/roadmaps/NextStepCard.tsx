import type { TopicSummary } from "@rumbo/core";
import { ArrowRightIcon, BookOpenIcon, PlusIcon } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { moduleHref } from "./links";
import { Tag } from "./Tag";

/** Lo siguiente que toca estudiar en un tema, con el botón para meterlo en tu día. */
export function NextStepCard({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap;
  const module = roadmap?.current;
  if (!roadmap) return null;

  async function addToToday() {
    if (!roadmap) return;
    const text = await rumbo.learning.planToday(roadmap);
    if (text)
      toast.success(roadmap.habit ? "Añadido a tu hábito de hoy" : "Añadido a tus tareas de hoy", {
        description: text,
      });
  }

  if (!module) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ruta terminada</CardTitle>
          <CardDescription>Has dominado todos los módulos de {roadmap.title}.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const exercise = roadmap.nextExercise;
  const concepts = module.content.concepts;
  const exercisesDone = module.exercises.filter((item) => item.done).length;

  return (
    <Card className="border-primary/60 bg-linear-to-br from-primary-soft to-card ring-primary/50">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 font-mono text-xs tracking-widest text-primary-text uppercase">
          <BookOpenIcon className="size-4" />
          Siguiente paso
        </CardDescription>
        <CardTitle className="text-xl font-semibold">{module.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        {exercise ? (
          <div className="flex items-center gap-2">
            <Tag className="text-muted-foreground">Nivel {exercise.level}</Tag>
            <span className="truncate">
              Ejercicio {exercise.id} — {exercise.title}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">
            Ejercicios hechos. Repasa el criterio de dominado y márcalo.
          </span>
        )}
        <span className="text-muted-foreground">
          {concepts.filter((concept) => concept.done).length} de {concepts.length} conceptos ·{" "}
          {exercisesDone} de {module.exercises.length} ejercicios
        </span>
        <div className="mt-2 flex gap-2">
          <Button onClick={addToToday}>
            <PlusIcon data-icon="inline-start" />
            Añadir a hoy
          </Button>
          <Button variant="outline" render={<Link href={moduleHref(topic.path, module.name)} />}>
            <ArrowRightIcon data-icon="inline-start" />
            Abrir tema
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
