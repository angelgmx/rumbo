import type { Exercise, ModuleSummary, TopicSummary } from "@rumbo/core";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useParams } from "wouter";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { openUrl } from "@/platform/openUrl";
import { Breadcrumb } from "./Breadcrumb";
import { copyToIde, exerciseTime, LevelTag, Statement } from "./ExerciseDetail";
import { roadmapCrumbs } from "./crumbs";
import { roadmapHref } from "./links";
import { NoteReader } from "./NoteReader";
import { PageTitle } from "./PageTitle";
import { ResourceIcon } from "./ResourceIcon";
import { useDueCards } from "./ReviewDialog";
import { StatusMenu } from "./StatusMenu";
import { Tag } from "./Tag";

/** Un módulo de la ruta en tres pasos: aprende, practica y demuestra. */
export function ModuleScreen() {
  const params = useParams<{ topic: string; module: string }>();
  const topicPath = decodeURIComponent(params.topic ?? "");
  const moduleName = decodeURIComponent(params.module ?? "");
  const topic = useVaultQuery((r) => r.learning.topic(topicPath), [topicPath]).data;
  const module = topic?.roadmap?.modules.find((candidate) => candidate.name === moduleName);

  if (!topic || !module) {
    return (
      <>
        <ScreenHeader title={<Breadcrumb items={roadmapCrumbs(topic, moduleName)} />} />
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No encuentro este módulo</EmptyTitle>
            <EmptyDescription>Puede que la nota se haya movido o renombrado.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );
  }
  return <Module topic={topic} module={module} />;
}

function Module({ topic, module }: { topic: TopicSummary; module: ModuleSummary }) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  const [reading, setReading] = useState<string>();

  async function addToToday() {
    const text = await rumbo.learning.planToday(roadmap);
    if (text) toast.success("Añadido a hoy", { description: text });
  }

  return (
    <>
      <ScreenHeader
        title={<Breadcrumb items={roadmapCrumbs(topic, module.title)} />}
        actions={
          <>
            <Button variant="outline" onClick={() => setReading(module.path)}>
              <FileIcon data-icon="inline-start" />
              Ver la nota
            </Button>
            {roadmap.current?.path === module.path && (
              <Button variant="outline" onClick={addToToday}>
                <PlusIcon data-icon="inline-start" />
                Añadir a hoy
              </Button>
            )}
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <PageTitle
            backHref={roadmapHref(topic.path)}
            icon={topic}
            title={module.title}
            subtitle={`Módulo ${pad(module.order)} de ${roadmap.modules.length} · ruta «${roadmap.title}»`}
            aside={
              <StatusMenu
                status={module.status}
                onChange={(status) => rumbo.learning.setStatus(module, status)}
              />
            }
          />
          <ModuleStats topic={topic} module={module} />
          <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-4">
            <div className="flex flex-col gap-3">
              <LearnStep module={module} onOpen={setReading} />
              <PracticeStep module={module} />
              <ProveStep module={module} onOpen={setReading} />
            </div>
            <div className="flex flex-col gap-4">
              {module.content.criterion && (
                <Card className="border border-success/50 px-4 ring-0">
                  <span className="font-mono text-xs tracking-widest text-success uppercase">
                    Criterio de dominado
                  </span>
                  <p className="text-[15px] leading-relaxed">{module.content.criterion}</p>
                </Card>
              )}
              <ConceptsCard module={module} />
              <PracticeLogCard module={module} />
            </div>
          </div>
        </div>
      </main>
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </>
  );
}

function pad(order: number): string {
  return String(order).padStart(2, "0");
}

function ModuleStats({ topic, module }: { topic: TopicSummary; module: ModuleSummary }) {
  const roadmap = topic.roadmap!;
  const concepts = module.content.concepts;
  const known = concepts.filter((concept) => concept.done).length;
  const next = module.exercises.find((exercise) => !exercise.done);
  const minutesLeft = roadmap.plan.minutesLeft.get(module.path);
  const finishes = roadmap.plan.modules.get(module.path);
  const due = useDueCards(roadmap.title).filter((card) => card.module.path === module.path);

  return (
    <Card className="grid grid-cols-4 gap-0 divide-x px-0 py-5">
      <div className="flex items-center gap-4 px-5">
        <ProgressRing
          value={concepts.length ? known / concepts.length : 0}
          color="var(--primary)"
          size={52}
        />
        <StatText
          label="Conceptos"
          value={`${known} de ${concepts.length}`}
          hint="los que sabes explicar"
        />
      </div>
      <StatText
        className="px-5"
        label="Siguiente"
        value={next ? `Ejercicio ${next.id}` : "Criterio"}
        hint={next ? next.title : "ejercicios hechos: compruébalo"}
      />
      <StatText
        className="px-5"
        label="Te queda"
        value={minutesLeft === undefined ? "—" : formatMinutes(minutesLeft)}
        hint={
          finishes
            ? `a ${formatMinutes(roadmap.plan.weeklyMinutes)}/semana: hasta el ${formatDayMonth(finishes)}`
            : module.status === "mastered"
              ? "módulo dominado"
              : "ponle horario a la ruta"
        }
      />
      <StatText
        className="px-5"
        label="Repaso"
        value={`${due.length} hoy`}
        hint="conceptos de este módulo"
      />
    </Card>
  );
}

function StatText({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="truncate text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  done?: boolean;
  aside?: ReactNode;
  defaultOpen?: boolean;
  /** Sin contenido, el paso es un botón que hace `onClick`. */
  children?: ReactNode;
  onClick?: () => void;
}

/** Cada paso del módulo se despliega para ver lo que tiene dentro. */
function Step({
  number,
  title,
  description,
  done,
  aside,
  defaultOpen,
  children,
  onClick,
}: StepProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const expandable = Boolean(children);

  return (
    <Card className="gap-0 py-0">
      <button
        type="button"
        onClick={expandable ? () => setOpen(!open) : onClick}
        className="flex items-center gap-4 px-4 py-4 text-left"
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs",
            done && "border-success bg-success text-background",
            !done && open && "border-primary/50 bg-primary-soft text-primary-text",
          )}
        >
          {done ? <CheckIcon className="size-4" /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            Paso {number} · {title}
          </div>
          <div className="truncate text-xs text-muted-foreground">{description}</div>
        </div>
        {aside}
        {expandable ? (
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-(--dur-fast)",
              !open && "-rotate-90",
            )}
          />
        ) : (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
      </button>
      {expandable && open && <div className="border-t px-4 py-3">{children}</div>}
    </Card>
  );
}

function LearnStep({ module, onOpen }: { module: ModuleSummary; onOpen: (path: string) => void }) {
  // Leído: ya empezaste el módulo y no te queda ningún recurso por ver.
  const read =
    module.status !== "not-started" &&
    module.resources.every((resource) => resource.status === "done" || resource.status === "skip");
  const videos = module.resources.filter((resource) => resource.kind === "video").length;
  const counts = [
    `${module.notes.length} apuntes`,
    videos > 0 && `${videos} vídeo${videos > 1 ? "s" : ""}`,
  ];

  return (
    <Step
      number={1}
      title="Aprende"
      description={`${counts.filter(Boolean).join(" · ")} · lee con calma y escribe con tus palabras`}
      done={read}
      aside={
        read && (
          <Tag dot className="text-success">
            Leído
          </Tag>
        )
      }
      defaultOpen={module.status === "not-started"}
    >
      <div className="flex flex-col">
        {module.notes.map((note) => (
          <button
            key={note.path}
            type="button"
            onClick={() => onOpen(note.path)}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted/50"
          >
            <FileIcon className="size-4 text-muted-foreground" />
            {note.name}
          </button>
        ))}
        {module.resources.map((resource, index) => (
          <button
            key={`${resource.title}-${index}`}
            type="button"
            disabled={!resource.url}
            onClick={() => resource.url && void openUrl(resource.url)}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 text-left enabled:hover:bg-muted/50"
          >
            <ResourceIcon kind={resource.kind} />
            <span className="flex-1 truncate">{resource.title}</span>
            <span className="text-xs text-muted-foreground">{resource.source}</span>
          </button>
        ))}
      </div>
    </Step>
  );
}

function PracticeStep({ module }: { module: ModuleSummary }) {
  const rumbo = useRumbo();
  const done = module.exercises.filter((exercise) => exercise.done).length;
  const next = module.exercises.find((exercise) => !exercise.done);
  if (module.exercises.length === 0) return null;

  return (
    <Step
      number={2}
      title="Practica"
      description={`${done} de ${module.exercises.length} ejercicios · regla de los 20 minutos: lucha antes de mirar nada`}
      done={done === module.exercises.length}
      aside={<Progress value={(done / module.exercises.length) * 100} className="mr-2 h-1 w-36" />}
      defaultOpen={module.status === "learning"}
    >
      <div className="flex flex-col gap-1">
        {module.exercises.map((exercise) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            isNext={exercise.id === next?.id}
            onToggle={(isDone) => rumbo.learning.setExerciseDone(module, exercise.id, isDone)}
          />
        ))}
      </div>
    </Step>
  );
}

interface ExerciseRowProps {
  exercise: Exercise;
  isNext: boolean;
  onToggle: (done: boolean) => void;
}

/** El siguiente ejercicio sale abierto; los demás se abren al pulsarlos. */
function ExerciseRow({ exercise, isNext, onToggle }: ExerciseRowProps) {
  const [open, setOpen] = useState(isNext);

  return (
    <div
      className={cn(
        "rounded-lg border border-transparent",
        open && "border-primary/50 bg-primary-soft/40",
      )}
    >
      <div className="grid grid-cols-[auto_1fr_200px_70px_100px] items-center gap-3 px-3 py-2.5">
        <Checkbox
          checked={exercise.done}
          onCheckedChange={(checked) => onToggle(checked === true)}
          aria-label={`Hecho: ${exercise.title}`}
        />
        <button
          type="button"
          className="flex items-center gap-3 text-left"
          onClick={() => setOpen(!open)}
        >
          <span className="font-mono text-xs text-muted-foreground">{exercise.id}</span>
          <span className={cn(exercise.done && "text-muted-foreground line-through")}>
            {exercise.title}
          </span>
        </button>
        <LevelTag exercise={exercise} />
        <span className="font-mono text-xs text-muted-foreground">{exerciseTime(exercise)}</span>
        <span className="justify-self-end">
          {exercise.done ? (
            <Tag dot className="text-success">
              Hecho
            </Tag>
          ) : isNext ? (
            <Tag dot className="text-primary-text">
              Siguiente
            </Tag>
          ) : (
            <Tag className="text-muted-foreground">Pendiente</Tag>
          )}
        </span>
      </div>
      {open && (
        <div className="flex flex-col gap-3 px-3 pb-3 pl-10">
          <Statement exercise={exercise} compact />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => copyToIde(exercise)}>
              Copiar al IDE
            </Button>
            {!exercise.done && (
              <Button size="sm" variant="outline" onClick={() => onToggle(true)}>
                <CheckIcon data-icon="inline-start" />
                Marcar hecho
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProveStep({ module, onOpen }: { module: ModuleSummary; onOpen: (path: string) => void }) {
  const challenge = module.challenges[0];
  if (!challenge) return null;
  return (
    <Step
      number={3}
      title="Demuestra"
      description={`${challenge.name} · cuando cumplas el criterio`}
      onClick={() => onOpen(challenge.path)}
    />
  );
}

function ConceptsCard({ module }: { module: ModuleSummary }) {
  const rumbo = useRumbo();
  const { concepts } = module.content;
  const known = concepts.filter((concept) => concept.done).length;

  return (
    <Card className="gap-2 px-4">
      <div className="flex items-center gap-2 pb-1">
        <CheckIcon className="size-4 text-muted-foreground" />
        <span className="flex-1">Conceptos a dominar</span>
        <span className="font-mono text-xs text-muted-foreground">
          {known}/{concepts.length}
        </span>
      </div>
      {concepts.map((concept) => (
        <label key={concept.line} className="flex items-start gap-3 py-1">
          <Checkbox
            className="mt-0.5"
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

function PracticeLogCard({ module }: { module: ModuleSummary }) {
  const rumbo = useRumbo();
  const [what, setWhat] = useState("");
  const [how, setHow] = useState("");
  const { sessions, lastSession } = module.content;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!what.trim()) return;
    await rumbo.learning.logPractice(module, { what, how });
    toast.success("Sesión apuntada en el registro de práctica");
    setWhat("");
    setHow("");
  }

  return (
    <Card className="gap-3 px-4">
      <div className="flex items-center gap-2">
        <PencilIcon className="size-4 text-muted-foreground" />
        <span className="flex-1">Registro de práctica</span>
        <span className="text-xs text-muted-foreground">
          {sessions} {sessions === 1 ? "sesión" : "sesiones"}
        </span>
      </div>
      <form onSubmit={save} className="flex flex-col gap-2">
        <Input
          value={what}
          onChange={(event) => setWhat(event.target.value)}
          placeholder="Qué practiqué…"
          aria-label="Qué practiqué"
        />
        <Input
          value={how}
          onChange={(event) => setHow(event.target.value)}
          placeholder="Cómo fue…"
          aria-label="Cómo fue"
        />
        <Button type="submit" className="self-end" disabled={!what.trim()}>
          Apuntar
        </Button>
      </form>
      {lastSession && (
        <p className="text-xs text-muted-foreground">
          {/^\d{4}-\d{2}-\d{2}$/.test(lastSession.date)
            ? formatDayMonth(lastSession.date)
            : lastSession.date}{" "}
          · {lastSession.what}
          {lastSession.how && ` · ${lastSession.how}`}
        </p>
      )}
    </Card>
  );
}
