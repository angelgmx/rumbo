import type { Exercise, ExerciseLevel, TopicSummary } from "@rumbo/core";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { OptionSelect } from "@/components/OptionSelect";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { ExerciseDetail, exerciseTime } from "./ExerciseDetail";
import { LEVEL_NAME, LEVEL_STYLE } from "./moduleStatus";
import { NoteReader } from "./NoteReader";

type Filter = "pending" | "done" | "all";
const LEVELS: ExerciseLevel[] = [1, 2, 3, 4];

/** Pestaña Ejercicios: la lista de un módulo por niveles y el ejercicio abierto al lado. */
export function TopicExercises({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const modules = (topic.roadmap?.modules ?? []).filter((module) => module.exercises.length > 0);
  const [modulePath, setModulePath] = useState(
    () =>
      (modules.find((module) => module.path === topic.roadmap?.current?.path) ?? modules[0])?.path,
  );
  const [filter, setFilter] = useState<Filter>("pending");
  const [levels, setLevels] = useState<ExerciseLevel[]>([]);
  const [reading, setReading] = useState<string>();
  const module = modules.find((candidate) => candidate.path === modulePath);
  const [selectedId, setSelectedId] = useState(
    () => module?.exercises.find((exercise) => !exercise.done)?.id,
  );
  if (!module) return null;

  const visible = module.exercises.filter(
    (exercise) =>
      (filter === "all" || exercise.done === (filter === "done")) &&
      (levels.length === 0 || levels.includes(exercise.level)),
  );
  const selected = module.exercises.find((exercise) => exercise.id === selectedId) ?? visible[0];

  const toggle = (exercise: Exercise, done: boolean) =>
    rumbo.learning.setExerciseDone(module, exercise.id, done);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[filter]}
          onValueChange={(values) => values[0] && setFilter(values[0] as Filter)}
        >
          <ToggleGroupItem value="pending">Pendientes</ToggleGroupItem>
          <ToggleGroupItem value="done">Hechos</ToggleGroupItem>
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          multiple
          variant="outline"
          size="sm"
          spacing={1}
          value={levels.map(String)}
          onValueChange={(values) => setLevels(values.map(Number) as ExerciseLevel[])}
        >
          {LEVELS.map((level) => (
            <ToggleGroupItem key={level} value={String(level)} className="gap-1.5">
              <span className={cn("size-1.5 rounded-full bg-current", LEVEL_STYLE[level])} />
              Nivel {level}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="ml-auto w-64">
          <OptionSelect
            options={modules.map((option) => ({
              label: `Módulo: ${option.title}`,
              value: option.path,
            }))}
            value={module.path}
            onChange={(value) => {
              setModulePath(value ?? undefined);
              setSelectedId(undefined);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-4">
        <Card className="gap-1 px-2 py-3">
          {visible.length === 0 && (
            <p className="px-3 py-6 text-center text-muted-foreground">
              Nada por aquí con estos filtros.
            </p>
          )}
          <ExerciseGroups
            exercises={visible}
            selected={selected?.id}
            onSelect={setSelectedId}
            onToggle={toggle}
          />
        </Card>
        {selected && (
          <Card className="px-6 py-6">
            <ExerciseDetail
              exercise={selected}
              module={module.title}
              onToggle={(done) => toggle(selected, done)}
              onOpenNote={module.exercisesPath ? () => setReading(module.exercisesPath) : undefined}
            />
          </Card>
        )}
      </div>
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </div>
  );
}

interface ExerciseGroupsProps {
  exercises: Exercise[];
  selected?: string;
  onSelect: (id: string) => void;
  onToggle: (exercise: Exercise, done: boolean) => void;
}

function ExerciseGroups({ exercises, selected, onSelect, onToggle }: ExerciseGroupsProps) {
  return LEVELS.map((level) => {
    const ofLevel = exercises.filter((exercise) => exercise.level === level);
    if (ofLevel.length === 0) return null;
    return (
      <div key={level} className="flex flex-col gap-1">
        <span className="px-3 pt-2 pb-1 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Nivel {level} · {ofLevel[0]!.levelName || LEVEL_NAME[level]}
        </span>
        {ofLevel.map((exercise) => (
          <div
            key={exercise.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-(--dur-fast) hover:bg-muted/40",
              exercise.id === selected && "border-primary/60 bg-primary-soft/50",
            )}
          >
            <Checkbox
              checked={exercise.done}
              onCheckedChange={(checked) => onToggle(exercise, checked === true)}
              aria-label={`Hecho: ${exercise.title}`}
            />
            <button
              type="button"
              className="flex flex-1 items-center gap-3 text-left"
              onClick={() => onSelect(exercise.id)}
            >
              <span className="font-mono text-xs text-muted-foreground">{exercise.id}</span>
              <span className="flex-1">{exercise.title}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {exerciseTime(exercise)}
              </span>
            </button>
          </div>
        ))}
      </div>
    );
  });
}
