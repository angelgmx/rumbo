import {
  capacityUntil,
  trimToFit,
  type IsoDate,
  type ModuleSummary,
  type RoadmapSummary,
} from "@rumbo/core";
import { GaugeIcon } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { paceLabel } from "./paceLabels";

// El ritmo sale de tu horario frente a la fecha objetivo (todavía no hay horas reales).
// Si no llegas, siempre hay tres salidas: más tiempo al día, otra fecha o menos alcance.

/** Ritmo de la ruta: si llegas a la fecha y, si no, qué puedes cambiar. */
export function PaceCard({ roadmap }: { roadmap: RoadmapSummary }) {
  const { plan, pace } = roadmap;
  const label = paceLabel(roadmap);
  const doneMinutes = plan.totalMinutes - plan.remainingMinutes;

  return (
    <Card className="gap-4 px-5">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-warning uppercase">
            <GaugeIcon className="size-4" />
            Ritmo
          </span>
          <span className={cn("text-2xl font-semibold", label.tone)}>{label.text}</span>
          <p className="text-muted-foreground">{explanation(roadmap)}</p>
        </div>
        <div className="flex w-48 shrink-0 flex-col items-end gap-2">
          <span className="font-mono">
            {formatMinutes(doneMinutes)} de {formatMinutes(plan.totalMinutes)}
          </span>
          <span className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full bg-warning"
              style={{ width: `${pace.progress * 100}%` }}
            />
          </span>
        </div>
      </div>
      {pace.state === "behind" && <CatchUpOptions roadmap={roadmap} />}
      {pace.state === "no-deadline" && plan.finishes && <SetDeadline roadmap={roadmap} />}
    </Card>
  );
}

function explanation(roadmap: RoadmapSummary): string {
  const { pace, plan, deadline } = roadmap;
  const planned = formatMinutes(Math.round(pace.plannedMinutesPerDay));
  const finishes = plan.finishes ? formatDayMonth(plan.finishes) : undefined;

  if (!deadline) {
    return finishes
      ? `Sin fecha objetivo. Con tu horario (${planned} al día) la terminas el ${finishes}.`
      : "Sin fecha objetivo ni horario para calcular cuándo terminas.";
  }
  const required = formatMinutes(Math.round(pace.requiredMinutesPerDay ?? 0));
  if (pace.state === "behind") {
    const end = finishes
      ? ` A este ritmo terminas el ${finishes}, no el ${formatDayMonth(deadline)}.`
      : "";
    return `Necesitas ${required} al día y tu horario da ${planned}.${end}`;
  }
  return `Tu horario da ${planned} al día y hacen falta ${required}. Llegas al ${formatDayMonth(deadline)}.`;
}

function CatchUpOptions({ roadmap }: { roadmap: RoadmapSummary }) {
  const rumbo = useRumbo();
  const { pace, plan, deadline } = roadmap;
  const toSkip = scopeToCut(roadmap, rumbo.daily.today());
  const saved = toSkip.reduce((sum, module) => sum + (plan.minutesLeft.get(module.path) ?? 0), 0);

  async function moveDeadline() {
    await rumbo.learning.setDeadline(roadmap, plan.finishes);
    toast.success(`Fecha objetivo movida al ${formatDayMonth(plan.finishes!)}`);
  }

  async function cutScope() {
    await rumbo.learning.skipModules(toSkip);
    toast.success("Alcance reducido", {
      description: `Saltados: ${toSkip.map((module) => module.title).join(", ")}`,
    });
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Option
        letter="A"
        highlighted
        title={`Sube a ${formatMinutes(Math.round(pace.requiredMinutesPerDay!))} al día`}
      >
        Llegas el {formatDayMonth(deadline!)}. Cámbialo en el horario de la ruta.
      </Option>
      {plan.finishes && (
        <Option letter="B" title="Mueve la fecha" onClick={moveDeadline}>
          Al {formatDayMonth(plan.finishes)}, sin prisa
        </Option>
      )}
      {toSkip.length > 0 && (
        <Option
          letter="C"
          title={`Quita ${toSkip.map((module) => module.title).join(", ")}`}
          onClick={cutScope}
        >
          Ahorras {formatMinutes(saved)}
        </Option>
      )}
    </div>
  );
}

/** Sin fecha: proponer como objetivo el día en que terminarías con tu horario. */
function SetDeadline({ roadmap }: { roadmap: RoadmapSummary }) {
  const rumbo = useRumbo();
  const finishes = roadmap.plan.finishes!;
  return (
    <Button
      variant="outline"
      className="w-fit"
      onClick={async () => {
        await rumbo.learning.setDeadline(roadmap, finishes);
        toast.success(`Fecha objetivo: ${formatDayMonth(finishes)}`);
      }}
    >
      Ponerme el {formatDayMonth(finishes)} como objetivo
    </Button>
  );
}

/** Los últimos módulos pendientes que sobran para que el resto quepa hasta la fecha. */
function scopeToCut(roadmap: RoadmapSummary, today: IsoDate): ModuleSummary[] {
  const { plan, deadline } = roadmap;
  // Solo se recortan módulos sin empezar: lo que está en marcha cuenta como fijo.
  const candidates = roadmap.modules
    .filter((module) => module.status === "not-started")
    .map((module) => ({ id: module.path, minutes: plan.minutesLeft.get(module.path) ?? 0 }));
  const cuttable = candidates.reduce((sum, item) => sum + item.minutes, 0);
  const fixed = plan.remainingMinutes - cuttable;
  const capacity = capacityUntil(plan.weeklyMinutes, today, deadline!);
  const cut = trimToFit(candidates, Math.max(capacity - fixed, 0));
  return roadmap.modules.filter((module) => cut.some((item) => item.id === module.path));
}

interface OptionProps {
  letter: string;
  title: string;
  children: ReactNode;
  highlighted?: boolean;
  onClick?: () => void;
}

function Option({ letter, title, children, highlighted, onClick }: OptionProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs",
          highlighted && "border-primary bg-primary text-primary-foreground",
        )}
      >
        {letter}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{children}</span>
      </span>
    </>
  );
  const className = cn(
    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left",
    highlighted && "border-primary/70 bg-primary-soft",
  );
  if (!onClick) return <div className={className}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(className, "transition-colors duration-(--dur-fast) hover:bg-muted/40")}
    >
      {content}
    </button>
  );
}
