import {
  exerciseCode,
  exerciseLanguage,
  exerciseMinutes,
  type Exercise,
  type ModuleSummary,
  type TopicSummary,
} from "@rumbo/core";
import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardCopyIcon,
  EyeIcon,
  FileTextIcon,
  LockIcon,
  PlayIcon,
  TimerIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { QUICK_MINUTES } from "@/features/focus/choice";
import { exerciseRequest } from "@/features/session/requests";
import { useSession } from "@/features/session/SessionProvider";
import { formatClock } from "@/hooks/useCountdown";
import { Breadcrumb } from "@/features/roadmaps/Breadcrumb";
import { copyToIde, fileName } from "@/features/roadmaps/ExerciseDetail";
import { LEVEL_NAME, LEVEL_STYLE } from "@/features/roadmaps/moduleStatus";
import { NoteReader } from "@/features/roadmaps/NoteReader";
import { ObsidianButton } from "@/features/roadmaps/ObsidianButton";
import { ResourceIcon } from "@/features/roadmaps/ResourceIcon";
import { Tag } from "@/features/roadmaps/Tag";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { capitalize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { openUrl } from "@/platform/openUrl";
import { CodeBlock } from "./CodeBlock";
import { exerciseState } from "./exerciseItems";
import { EXERCISES_HREF, exerciseHref } from "./links";
import { SolutionEditor } from "./SolutionEditor";

/** La nota de un ejercicio: enunciado, código para el IDE, ayudas y tu solución. */
export function ExerciseScreen() {
  const params = useParams<{ topic: string; module: string; exercise: string }>();
  const topicPath = decodeURIComponent(params.topic ?? "");
  const moduleName = decodeURIComponent(params.module ?? "");
  const topic = useVaultQuery((r) => r.learning.topic(topicPath), [topicPath]).data;
  const module = topic?.roadmap?.modules.find((candidate) => candidate.name === moduleName);
  const exercise = module?.exercises.find((candidate) => candidate.id === params.exercise);

  if (!topic || !module || !exercise) {
    return (
      <>
        <ScreenHeader
          title={<Breadcrumb items={[{ label: "Ejercicios", href: EXERCISES_HREF }]} />}
        />
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No encuentro este ejercicio</EmptyTitle>
            <EmptyDescription>Puede que la nota se haya movido o renombrado.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );
  }
  return (
    <ExerciseNote
      key={`${module.path}-${exercise.id}`}
      topic={topic}
      module={module}
      exercise={exercise}
    />
  );
}

interface NoteProps {
  topic: TopicSummary;
  module: ModuleSummary;
  exercise: Exercise;
}

function ExerciseNote({ topic, module, exercise }: NoteProps) {
  const rumbo = useRumbo();
  const [reading, setReading] = useState<string>();
  const file = fileName(exercise.statement);
  const prose = statementProse(exercise.statement);

  return (
    <>
      <ScreenHeader
        title={
          <Breadcrumb
            items={[
              { label: "Ejercicios", href: EXERCISES_HREF },
              { label: module.title },
              { label: exercise.title },
            ]}
          />
        }
        actions={
          <>
            {module.exercisesPath && <ObsidianButton path={module.exercisesPath} />}
            <Button
              variant={exercise.done ? "outline" : "default"}
              onClick={() => rumbo.learning.setExerciseDone(module, exercise.id, !exercise.done)}
            >
              <CheckIcon data-icon="inline-start" />
              {exercise.done ? "Resuelto" : "Marcar resuelto"}
            </Button>
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_420px] items-start gap-4">
          <Card className="gap-8 px-10 py-10">
            <Header topic={topic} module={module} exercise={exercise} />
            {prose && (
              <Section title="Enunciado">
                <Markdown source={prose} className="prose-sm max-w-[70ch]" />
              </Section>
            )}
            <Section title="Código inicial" detail="cópialo a tu IDE">
              <CodeBlock
                code={exerciseCode(exercise.statement)}
                label={file}
                actions={
                  <Button size="sm" variant="outline" onClick={() => copyToIde(exercise)}>
                    <ClipboardCopyIcon data-icon="inline-start" />
                    Copiar
                  </Button>
                }
              />
            </Section>
            {exercise.hints.length > 0 && (
              <Section title="Pistas" detail="solo si te atascas">
                {exercise.hints.map((hint, index) => (
                  <Hint key={hint} number={index + 1} text={hint} />
                ))}
              </Section>
            )}
            {exercise.tests && (
              <Section title="Tests" detail="para comprobarlo tú">
                <CodeBlock code={exercise.tests} />
              </Section>
            )}
            {exercise.solution && (
              <Section title="Solución">
                <Solution code={exercise.solution} />
              </Section>
            )}
            <Section title="Mi solución">
              <SolutionEditor
                solution={exercise.mySolution}
                fileName={file}
                onSave={(code) => rumbo.learning.saveSolution(module, exercise, code)}
              />
            </Section>
          </Card>

          <aside className="flex flex-col gap-4">
            <SessionCard topic={topic} module={module} exercise={exercise} />
            <CriterionCard module={module} />
            <HelpCard module={module} onOpenNote={setReading} />
            <NextCard topic={topic} module={module} exercise={exercise} />
          </aside>
        </div>
      </main>
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </>
  );
}

function Header({ topic, module, exercise }: NoteProps) {
  const language = exerciseLanguage(exercise.statement);
  const state = exerciseState({ topic, module, exercise });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Tag dot className={LEVEL_STYLE[exercise.level]}>
          Nivel {exercise.level} · {exercise.levelName || LEVEL_NAME[exercise.level]}
        </Tag>
        {language && <Tag className="text-muted-foreground">{capitalize(language)}</Tag>}
        <Tag className="text-muted-foreground">{exerciseMinutes(exercise.level)} min</Tag>
        <Tag dot className={state === "done" ? "text-success" : "text-muted-foreground"}>
          {state === "done" ? "Resuelto" : state === "doing" ? "En curso" : "Pendiente"}
        </Tag>
      </div>
      <h1 className="font-serif text-5xl tracking-tight">{exercise.title}</h1>
      <p className="text-muted-foreground">
        {topic.title} › {module.title} · ejercicio {exercise.id} de {module.exercises.length}
      </p>
    </div>
  );
}

function Section({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {detail && <span className="text-sm text-muted-foreground">{detail}</span>}
      </div>
      {children}
    </section>
  );
}

/** Una pista tapada: se descubre a propósito, de una en una. */
function Hint({ number, text }: { number: number; text: string }) {
  const [shown, setShown] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left"
    >
      <EyeIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="shrink-0 font-medium">Pista {number}</span>
      {shown ? (
        <span className="text-muted-foreground">{text}</span>
      ) : (
        <>
          <span className="h-2 flex-1 rounded-full bg-muted" />
          <span className="text-sm text-muted-foreground">Mostrar</span>
        </>
      )}
    </button>
  );
}

/** La solución, cerrada por defecto: primero se lucha (regla de los 20 minutos). */
function Solution({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left"
      >
        <LockIcon className="size-4 text-muted-foreground" />
        <span className="font-medium">{open ? "Ocultar solución" : "Ver solución"}</span>
        <span className="text-sm text-muted-foreground">inténtalo antes 20 minutos</span>
        <ChevronDownIcon
          className={cn("ml-auto size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <CodeBlock code={code} />}
    </div>
  );
}

function SessionCard({ topic, module, exercise }: NoteProps) {
  const session = useSession();
  const request = exerciseRequest(topic, module, exercise);

  return (
    <Card className="gap-4 border border-primary/60 bg-linear-to-b from-primary-soft to-card px-5 ring-0">
      <span className="font-mono text-xs tracking-widest text-primary-text uppercase">
        Cuando quieras
      </span>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-5xl font-semibold">
          {formatClock(request.minutes * 60)}
        </span>
        <span className="text-muted-foreground">temporizador</span>
      </div>
      <Button size="lg" onClick={() => session.start(request)}>
        <PlayIcon data-icon="inline-start" />
        Empezar
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => session.start({ ...request, minutes: QUICK_MINUTES })}
          className="flex items-center gap-2 hover:text-foreground"
        >
          <TimerIcon className="size-4" />
          Solo {QUICK_MINUTES} minutos
        </button>
        <span className="text-muted-foreground">regla de los 20 min</span>
      </div>
    </Card>
  );
}

function CriterionCard({ module }: { module: ModuleSummary }) {
  const rumbo = useRumbo();
  const concepts = module.content.concepts;
  if (concepts.length === 0) return null;
  const done = concepts.filter((concept) => concept.done).length;

  return (
    <Card className="gap-3 px-5">
      <div className="flex justify-between">
        <span className="flex items-center gap-2 font-medium">
          <CheckIcon className="size-4" />
          Criterio de dominado
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {done} de {concepts.length}
        </span>
      </div>
      {concepts.map((concept) => (
        <label key={concept.line} className="flex items-center gap-3">
          <Checkbox
            checked={concept.done}
            onCheckedChange={(checked) =>
              rumbo.learning.setConcept(module, concept.line, checked === true)
            }
          />
          <span className={cn(concept.done && "text-muted-foreground")}>{concept.text}</span>
        </label>
      ))}
    </Card>
  );
}

/** Lo que tienes a mano para resolverlo: tus apuntes del módulo y sus recursos. */
function HelpCard({
  module,
  onOpenNote,
}: {
  module: ModuleSummary;
  onOpenNote: (path: string) => void;
}) {
  if (module.notes.length === 0 && module.resources.length === 0) return null;
  return (
    <Card className="gap-1 px-3">
      <span className="flex items-center gap-2 px-2 pb-2 font-medium">
        <FileTextIcon className="size-4" />
        Para resolverlo
      </span>
      {module.notes.slice(0, 2).map((note) => (
        <HelpRow
          key={note.path}
          icon={<FileTextIcon className="size-4" />}
          title={note.name}
          detail="tus apuntes"
          onClick={() => onOpenNote(note.path)}
        />
      ))}
      {module.resources.slice(0, 3).map((resource) => (
        <HelpRow
          key={resource.title}
          icon={<ResourceIcon kind={resource.kind} />}
          title={resource.title}
          detail={resource.source ?? ""}
          onClick={resource.url ? () => void openUrl(resource.url!) : undefined}
        />
      ))}
    </Card>
  );
}

function HelpRow({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted/40 disabled:hover:bg-transparent"
    >
      <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      <span className="flex-1 truncate">{title}</span>
      <span className="truncate font-mono text-xs text-muted-foreground">{detail}</span>
    </button>
  );
}

function NextCard({ topic, module, exercise }: NoteProps) {
  const index = module.exercises.findIndex((candidate) => candidate.id === exercise.id);
  const next = module.exercises[index + 1];
  if (!next) return null;
  return (
    <Link href={exerciseHref(topic.path, module.name, next.id)} className="group">
      <Card className="gap-2 px-5 transition-shadow duration-(--dur-fast) group-hover:ring-foreground/25">
        <span className="text-sm text-muted-foreground">Siguiente</span>
        <div className="flex items-center justify-between gap-3">
          <span className="truncate font-semibold">{next.title}</span>
          <Tag dot className={LEVEL_STYLE[next.level]}>
            Nivel {next.level}
          </Tag>
        </div>
      </Card>
    </Link>
  );
}

/** El texto del enunciado sin el código ni la línea «Mi solución: …» de las notas antiguas. */
function statementProse(statement: string): string {
  return statement
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .filter((line) => !/^\*\*Mi solución:\*\*/.test(line.trim()))
    .join("\n")
    .trim();
}
