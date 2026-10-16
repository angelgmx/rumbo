import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import {
  ArrowRightIcon,
  CodeIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FlagIcon,
  PlusIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { exerciseHref } from "@/features/exercises/links";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { openUrl } from "@/platform/openUrl";
import { moduleHref } from "./links";
import { STATUS_LABEL, STATUS_STYLE } from "./moduleStatus";
import { ResourceIcon } from "./ResourceIcon";
import { Tag } from "./Tag";

interface ModulePanelProps {
  topic: TopicSummary;
  module: ModuleSummary;
  onOpenNote: (path: string) => void;
}

/** El módulo pulsado en el diagrama: cuánto lleva, con qué se aprende y qué toca practicar. */
export function ModulePanel({ topic, module, onOpenNote }: ModulePanelProps) {
  const roadmap = topic.roadmap!;
  const isCurrent = module.path === roadmap.current?.path;
  const track = roadmap.tracks.find((item) => item.key === module.track);

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start gap-3 px-5 pt-5 pb-4">
        <AreaIcon
          area={{ icon: topic.icon, color: topic.color ?? "var(--muted-foreground)" }}
          className="size-10 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold">{module.title}</h2>
          <p className="text-sm text-muted-foreground">
            {roadmap.tracks.length > 1 && track ? `Pista ${track.label} · ` : ""}
            módulo {String(module.order).padStart(2, "0")}
          </p>
        </div>
        {isCurrent ? (
          <Tag dot className="text-primary-text">
            Ahora
          </Tag>
        ) : (
          <Tag dot className={STATUS_STYLE[module.status]}>
            {STATUS_LABEL[module.status]}
          </Tag>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 pb-5">
        <TimeBox topic={topic} module={module} />
        {module.resources.length > 0 && (
          <Section title="Recursos">
            {module.resources.map((resource) => (
              <button
                key={resource.title}
                type="button"
                disabled={!resource.url}
                onClick={() => resource.url && void openUrl(resource.url)}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-(--dur-fast) hover:bg-muted/40 disabled:hover:bg-transparent"
              >
                <ResourceIcon kind={resource.kind} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{resource.title}</span>
                  {resource.source && (
                    <span className="block truncate font-mono text-xs text-primary-text">
                      {resource.source}
                    </span>
                  )}
                </span>
                {resource.url && <ExternalLinkIcon className="size-4 text-muted-foreground" />}
              </button>
            ))}
          </Section>
        )}
        {module.notes.length > 0 && (
          <Section title="Apuntes" count={module.notes.length}>
            {module.notes.slice(0, 4).map((note) => (
              <button
                key={note.path}
                type="button"
                onClick={() => onOpenNote(note.path)}
                className="flex items-center gap-3 rounded-md px-1 py-1.5 text-left hover:bg-muted/40"
              >
                <FileTextIcon className="size-4 text-muted-foreground" />
                <span className="truncate">{note.name}</span>
              </button>
            ))}
          </Section>
        )}
        <Practice topic={topic} module={module} onOpenNote={onOpenNote} />
      </div>

      <PanelActions topic={topic} module={module} isCurrent={isCurrent} />
    </Card>
  );
}

function TimeBox({ topic, module }: { topic: TopicSummary; module: ModuleSummary }) {
  const plan = topic.roadmap!.plan;
  const left = plan.minutesLeft.get(module.path);
  const finishes = plan.modules.get(module.path);
  const concepts = module.content.concepts;
  const done = concepts.filter((concept) => concept.done).length;
  const share = module.status === "mastered" ? 1 : concepts.length ? done / concepts.length : 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-4 py-3">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Estimadas" value={formatMinutes(module.estimatedMinutes)} />
        <Stat label="Quedan" value={left !== undefined ? formatMinutes(left) : "—"} />
        <Stat label="Terminas" value={finishes ? formatDayMonth(finishes) : "—"} />
      </div>
      <span className="h-1 overflow-hidden rounded-full bg-muted">
        <span className="block h-full bg-primary" style={{ width: `${share * 100}%` }} />
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function Practice({ topic, module, onOpenNote }: ModulePanelProps) {
  const next = module.exercises.find((exercise) => !exercise.done);
  const done = module.exercises.filter((exercise) => exercise.done).length;
  if (module.exercises.length === 0 && module.challenges.length === 0) return null;

  return (
    <Section title="Práctica">
      {module.exercises.length > 0 && (
        <Link
          href={exerciseHref(topic.path, module.name, (next ?? module.exercises[0]!).id)}
          className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-(--dur-fast) hover:bg-muted/40"
        >
          <CodeIcon className="size-4 text-muted-foreground" />
          <span className="font-medium">Ejercicios</span>
          <span className="truncate text-sm text-muted-foreground">
            {done} de {module.exercises.length}
            {next ? ` · siguiente: ${next.title}` : " · todos hechos"}
          </span>
        </Link>
      )}
      {module.challenges.map((challenge) => (
        <button
          key={challenge.path}
          type="button"
          onClick={() => onOpenNote(challenge.path)}
          className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-(--dur-fast) hover:bg-muted/40"
        >
          <FlagIcon className="size-4 text-warning" />
          <span className="truncate">{challenge.name}</span>
        </button>
      ))}
    </Section>
  );
}

function PanelActions({
  topic,
  module,
  isCurrent,
}: {
  topic: TopicSummary;
  module: ModuleSummary;
  isCurrent: boolean;
}) {
  const rumbo = useRumbo();

  async function addToToday() {
    const text = await rumbo.learning.planToday(topic.roadmap!);
    if (text) toast.success("Añadido a hoy", { description: text });
  }

  return (
    <div className="mt-auto flex items-center justify-between border-t px-5 py-4">
      <Button variant="outline" render={<Link href={moduleHref(topic.path, module.name)} />}>
        <ArrowRightIcon data-icon="inline-start" />
        Abrir módulo
      </Button>
      {isCurrent && (
        <Button onClick={addToToday}>
          <PlusIcon data-icon="inline-start" />
          Añadir a hoy
        </Button>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex justify-between font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
        <span>{title}</span>
        {count !== undefined && <span>{count}</span>}
      </div>
      {children}
    </section>
  );
}
