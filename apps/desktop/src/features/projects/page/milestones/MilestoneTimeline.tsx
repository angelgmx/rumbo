import { type ProjectSummary, todayOnTimeline } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { MilestoneStop, STOP_RADIUS, stopLeft, type StopPlace } from "./MilestoneStop";

/** Cuánto ocupa cada hito como mínimo: con muchos, la línea se desplaza en horizontal. */
const STOP_WIDTH_REM = 11;

function placeOf(index: number, last: number): StopPlace {
  if (index === 0) return "first";
  return index === last ? "last" : "middle";
}

/**
 * Los hitos en una línea de tiempo horizontal, repartidos a partes iguales: el actual lleva
 * anillo, «hoy» se marca entre los hitos con fecha que lo rodean y el trazo verde llega hasta lo ya vivido.
 */
export function MilestoneTimeline({
  summary: { id, project, nextMilestone, milestoneTasks },
}: {
  summary: ProjectSummary;
}) {
  const today = useRumbo().daily.today();
  const { milestones } = project;
  const last = milestones.length - 1;
  const fraction = (index: number) => (last === 0 ? 0 : index / last);
  const lastDone = milestones.reduce(
    (found, milestone, index) => (milestone.done ? index : found),
    -1,
  );
  const todayAt = todayOnTimeline(milestones, today);
  const lived = Math.max(todayAt ?? 0, lastDone < 0 ? 0 : fraction(lastDone));
  const lineEdges = { left: STOP_RADIUS, right: STOP_RADIUS };

  return (
    <div className="overflow-x-auto">
      <div
        className="relative h-[7.5rem]"
        style={{ minWidth: `${milestones.length * STOP_WIDTH_REM}rem` }}
      >
        <div className="absolute top-[29px] h-0.5 rounded-full bg-border" style={lineEdges} />
        <div
          className="absolute top-[29px] h-0.5 rounded-full bg-success"
          style={{
            left: STOP_RADIUS,
            width: `calc((100% - ${STOP_RADIUS * 2}px) * ${lived})`,
          }}
        />
        {todayAt !== undefined && (
          <div
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
            style={{ left: stopLeft(todayAt) }}
          >
            <span className="text-xs text-primary-text">hoy</span>
            <span className="h-5 w-0.5 bg-primary" />
          </div>
        )}
        {milestones.map((milestone, index) => (
          <MilestoneStop
            key={milestone.id}
            projectId={id}
            milestone={milestone}
            place={placeOf(index, last)}
            fraction={fraction(index)}
            next={nextMilestone?.id === milestone.id}
            tasks={milestoneTasks[milestone.id] ?? { done: 0, total: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
