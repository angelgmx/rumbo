import {
  capacityUntil,
  trimToFit,
  type IsoDate,
  type ModuleSummary,
  type RoadmapSummary,
} from "@rumbo/core";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { formatDayMonth, formatMinutes } from "@/lib/format";

// Si no llegas, siempre hay tres salidas: más tiempo al día, otra fecha o menos alcance.

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

interface CatchUpOption {
  letter: "A" | "B" | "C";
  title: string;
  detail: string;
  /** La A solo explica qué cambiar; las otras dos se aplican con un clic. */
  apply?: () => Promise<void>;
}

/** Las salidas de una ruta que va por detrás, con lo que hace cada una. */
export function useCatchUp(roadmap: RoadmapSummary): CatchUpOption[] {
  const rumbo = useRumbo();
  const { pace, plan, deadline } = roadmap;
  const toSkip = scopeToCut(roadmap, rumbo.daily.today());
  const saved = toSkip.reduce((sum, module) => sum + (plan.minutesLeft.get(module.path) ?? 0), 0);

  const options: CatchUpOption[] = [
    {
      letter: "A",
      title: `Sube a ${formatMinutes(Math.round(pace.requiredMinutesPerDay!))} al día`,
      detail: `Llegas el ${formatDayMonth(deadline!)}. Cámbialo en el horario de la ruta.`,
    },
  ];
  if (plan.finishes) {
    const finishes = plan.finishes;
    options.push({
      letter: "B",
      title: "Mueve la fecha",
      detail: `Al ${formatDayMonth(finishes)}, sin prisa`,
      apply: async () => {
        await rumbo.learning.setDeadline(roadmap, finishes);
        toast.success(`Fecha objetivo movida al ${formatDayMonth(finishes)}`);
      },
    });
  }
  if (toSkip.length > 0) {
    options.push({
      letter: "C",
      title: `Quita ${toSkip.map((module) => module.title).join(", ")}`,
      detail: `Ahorras ${formatMinutes(saved)}`,
      apply: async () => {
        await rumbo.learning.skipModules(toSkip);
        toast.success("Alcance reducido", {
          description: `Saltados: ${toSkip.map((module) => module.title).join(", ")}`,
        });
      },
    });
  }
  return options;
}
