import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { ChevronRightIcon, FlagIcon } from "lucide-react";
import { Link } from "wouter";
import { ProgressRing } from "@/components/ProgressRing";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { moduleHref } from "./links";
import { STATUS_LABEL, STATUS_STYLE } from "./moduleStatus";
import { Tag } from "./Tag";
import { noteCount, topicExercises } from "./topic";

const COLUMNS = "grid-cols-[96px_1fr_190px_90px_120px_20px]";

/** Los módulos de la ruta en orden, con lo que llevas de cada uno. */
export function ModuleTable({ topic }: { topic: TopicSummary }) {
  const roadmap = topic.roadmap;
  if (!roadmap) return null;

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center gap-2 border-b px-4 py-3.5 text-sm">
        <FlagIcon className="size-4 text-primary-text" />
        <span className="text-muted-foreground">{roadmap.title}</span>
        <ChevronRightIcon className="size-3.5 text-muted-foreground" />
        <span>Módulos</span>
      </div>
      <div
        className={cn(
          "grid items-center gap-4 border-b px-4 py-2.5 text-xs text-muted-foreground",
          COLUMNS,
        )}
      >
        <span>Conceptos</span>
        <span>Módulo</span>
        <span>Ejercicios</span>
        <span>Terminas</span>
        <span>Estado</span>
        <span />
      </div>
      {roadmap.modules.map((module) => (
        <ModuleRow
          key={module.path}
          topicPath={topic.path}
          module={module}
          isCurrent={module.path === roadmap.current?.path}
          finishes={roadmap.plan.modules.get(module.path)}
        />
      ))}
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        {roadmap.modules.length} módulos · {noteCount(topic)} apuntes ·{" "}
        {topicExercises(topic).length} ejercicios · {topic.challenges.length} retos
      </div>
    </Card>
  );
}

interface ModuleRowProps {
  topicPath: string;
  module: ModuleSummary;
  isCurrent: boolean;
  finishes?: string;
}

function ModuleRow({ topicPath, module, isCurrent, finishes }: ModuleRowProps) {
  const concepts = module.content.concepts;
  const conceptsDone = concepts.filter((concept) => concept.done).length;
  const share = concepts.length ? conceptsDone / concepts.length : 0;
  const exercisesDone = module.exercises.filter((exercise) => exercise.done).length;

  return (
    <Link
      href={moduleHref(topicPath, module.name)}
      className={cn(
        "grid items-center gap-4 border-b border-l-2 border-l-transparent px-4 py-3 transition-colors duration-(--dur-fast) last:border-b-0 hover:bg-muted/40",
        COLUMNS,
        isCurrent && "border-l-primary bg-primary-soft/40",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="relative flex">
          <ProgressRing
            value={share}
            color={module.status === "mastered" ? "var(--success)" : "var(--primary)"}
            size={30}
          />
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] text-muted-foreground">
            {Math.round(share * 100)}%
          </span>
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {conceptsDone}/{concepts.length}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate">
          {String(module.order).padStart(2, "0")} · {module.title}
        </div>
        <div className="truncate font-mono text-[11px] text-muted-foreground">
          {module.notes.length} apuntes · {module.content.sessions} sesiones
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Progress
          value={module.exercises.length ? (exercisesDone / module.exercises.length) * 100 : 0}
          className="h-1"
        />
        <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
          {exercisesDone}/{module.exercises.length}
        </span>
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        {module.status === "mastered" ? "—" : finishes ? `≈ ${formatDayMonth(finishes)}` : ""}
      </span>
      <Tag dot className={STATUS_STYLE[module.status]}>
        {STATUS_LABEL[module.status]}
      </Tag>
      <ChevronRightIcon className="size-4 text-muted-foreground" />
    </Link>
  );
}
