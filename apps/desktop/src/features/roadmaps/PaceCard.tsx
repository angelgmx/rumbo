import type { RoadmapSummary } from "@rumbo/core";
import { GaugeIcon } from "lucide-react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CatchUpChoices } from "./CatchUpChoices";
import { paceLabel } from "./paceLabels";

// El ritmo sale de tu horario frente a la fecha objetivo (todavía no hay horas reales).

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
  return (
    <div className="grid grid-cols-3 gap-3">
      <CatchUpChoices roadmap={roadmap} />
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
