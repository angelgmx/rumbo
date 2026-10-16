import type { RoadmapSummary } from "@rumbo/core";
import { cn } from "@/lib/utils";
import { formatDayMonth } from "@/lib/format";
import { GLASS } from "./diagram/glass";
import { paceLabel } from "./paceLabels";

/** El estado de la ruta sobre el lienzo: progreso, ritmo, fin estimado y el módulo que toca. */
export function RoadmapStatusCard({ roadmap }: { roadmap: RoadmapSummary }) {
  const total = roadmap.modules.length;
  const percent = total ? Math.round((roadmap.mastered / total) * 100) : 0;
  const pace = paceLabel(roadmap);

  return (
    <div className={cn(GLASS, "flex w-72 flex-col gap-3 p-4")}>
      <h2 className="text-base leading-5 font-semibold">{roadmap.title}</h2>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-sm">
          <span>
            {roadmap.mastered} de {total} módulos
          </span>
          <span className="font-mono text-muted-foreground">{percent} %</span>
        </div>
        <span className="h-1 overflow-hidden rounded-full bg-muted">
          <span className="block h-full bg-primary" style={{ width: `${percent}%` }} />
        </span>
      </div>
      <dl className="flex flex-col gap-1 text-sm">
        <Row label="Ritmo" value={pace.text} tone={pace.tone} />
        {roadmap.plan.finishes && (
          <Row label="Fin estimado" value={formatDayMonth(roadmap.plan.finishes)} />
        )}
        {roadmap.current && <Row label="Siguiente" value={roadmap.current.title} />}
      </dl>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium", tone)}>{value}</dd>
    </div>
  );
}
