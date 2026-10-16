import { exerciseCode, exerciseMinutes, type Exercise } from "@rumbo/core";
import { CheckIcon, ClipboardCopyIcon, FileIcon, TimerIcon } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEVEL_NAME, LEVEL_STYLE } from "./moduleStatus";
import { Tag } from "./Tag";

const EXTENSIONS: Record<string, string> = {
  java: "java",
  python: "py",
  py: "py",
  typescript: "ts",
  ts: "ts",
  javascript: "js",
  js: "js",
};

/** "FizzBuzz.java", sacado de la clase del enunciado y del lenguaje del bloque de código. */
export function fileName(statement: string): string | undefined {
  const language = /```(\w+)/.exec(statement)?.[1]?.toLowerCase();
  const className = /\bclass\s+(\w+)/.exec(statement)?.[1];
  if (!language || !className) return undefined;
  return `${className}.${EXTENSIONS[language] ?? language}`;
}

export function LevelTag({ exercise }: { exercise: Exercise }) {
  return (
    <Tag className={LEVEL_STYLE[exercise.level]}>
      Nivel {exercise.level} · {exercise.levelName || LEVEL_NAME[exercise.level]}
    </Tag>
  );
}

export async function copyToIde(exercise: Exercise) {
  await navigator.clipboard.writeText(exerciseCode(exercise.statement));
  toast.success("Copiado. Pégalo en tu IDE y escribe la solución debajo.");
}

export function exerciseTime(exercise: Exercise): string {
  return `${exerciseMinutes(exercise.level)} min`;
}

/** El enunciado listo para copiar: el bloque de código y, si hay, el texto que lo acompaña. */
export function Statement({ exercise, compact }: { exercise: Exercise; compact?: boolean }) {
  const hasCode = exercise.statement.includes("```");
  const prose = exercise.statement.replace(/```[\s\S]*?```/g, "").trim();
  const name = fileName(exercise.statement);

  if (!hasCode) return <Markdown source={exercise.statement} className="prose-sm" />;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border bg-surface">
        {!compact && (
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              {name ? `${name} · enunciado` : "enunciado"}
            </span>
            <Button size="sm" onClick={() => copyToIde(exercise)}>
              <ClipboardCopyIcon data-icon="inline-start" />
              Copiar al IDE
            </Button>
          </div>
        )}
        <pre
          className={cn(
            "overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-muted-foreground",
            compact && "max-h-40",
          )}
        >
          {exerciseCode(exercise.statement)}
        </pre>
      </div>
      {prose && !compact && <Markdown source={prose} className="prose-sm" />}
    </div>
  );
}

interface ExerciseDetailProps {
  exercise: Exercise;
  module: string;
  onToggle: (done: boolean) => void;
  onOpenNote?: () => void;
}

/** El ejercicio abierto: enunciado, la regla de los 20 minutos y marcarlo hecho. */
export function ExerciseDetail({ exercise, module, onToggle, onOpenNote }: ExerciseDetailProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-muted-foreground">
          Ejercicio {exercise.id} · {module}
        </span>
        <LevelTag exercise={exercise} />
      </div>
      <h2 className="-mt-3 text-2xl font-semibold tracking-tight">{exercise.title}</h2>
      <Statement exercise={exercise} />
      <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3">
        <TimerIcon className="size-4 text-warning" />
        Regla de los 20 minutos: lucha antes de buscar nada.
      </div>
      <div className="flex gap-2">
        {exercise.done ? (
          <Button variant="outline" onClick={() => onToggle(false)}>
            Desmarcar
          </Button>
        ) : (
          <Button onClick={() => onToggle(true)}>
            <CheckIcon data-icon="inline-start" />
            Marcar hecho
          </Button>
        )}
        {onOpenNote && (
          <Button variant="outline" onClick={onOpenNote}>
            <FileIcon data-icon="inline-start" />
            Ver en la nota
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">
        Al terminar, apunta en el registro qué practicaste y cómo fue.
      </p>
    </div>
  );
}
