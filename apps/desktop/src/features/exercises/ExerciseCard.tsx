import { CircleCheckIcon, CircleDashedIcon, CircleIcon } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { exerciseTime } from "@/features/roadmaps/ExerciseDetail";
import { LEVEL_STYLE } from "@/features/roadmaps/moduleStatus";
import { Tag } from "@/features/roadmaps/Tag";
import { cn } from "@/lib/utils";
import { exerciseState, type ExerciseItem, type ExerciseState } from "./exerciseItems";
import { exerciseHref } from "./links";

const STATE_TEXT: Record<ExerciseState, string> = {
  done: "Resuelto",
  doing: "En curso",
  next: "Pendiente",
  pending: "Pendiente",
};

/** Un ejercicio en la galería: nivel, tiempo, de qué módulo es y cómo va. */
export function ExerciseCard({ item }: { item: ExerciseItem }) {
  const { topic, module, exercise } = item;
  const state = exerciseState(item);

  return (
    <Link href={exerciseHref(topic.path, module.name, exercise.id)} className="group flex">
      <Card
        className={cn(
          "w-full gap-0 py-0 transition-shadow duration-(--dur-fast) group-hover:ring-foreground/25",
          state === "next" && "border-primary/70 bg-primary-soft/40 ring-0",
        )}
      >
        <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <Tag dot className={LEVEL_STYLE[exercise.level]}>
              Nivel {exercise.level}
            </Tag>
            <span className="font-mono text-xs text-muted-foreground">
              {exerciseTime(exercise)}
            </span>
          </div>
          <div>
            <div className="truncate font-semibold">{exercise.title}</div>
            <div className="truncate text-sm text-muted-foreground">
              {topic.title} › {module.title}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-2.5 text-sm">
          <StateLabel state={state} />
          {state === "next" && <span className="text-primary-text">Siguiente</span>}
        </div>
      </Card>
    </Link>
  );
}

function StateLabel({ state }: { state: ExerciseState }) {
  const Icon =
    state === "done" ? CircleCheckIcon : state === "doing" ? CircleDashedIcon : CircleIcon;
  return (
    <span
      className={cn(
        "flex items-center gap-2",
        state === "done" && "text-success",
        state === "doing" && "text-primary-text",
        (state === "next" || state === "pending") && "text-muted-foreground",
      )}
    >
      <Icon className="size-4" />
      {STATE_TEXT[state]}
    </span>
  );
}
