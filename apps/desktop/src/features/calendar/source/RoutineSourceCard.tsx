import { isRoutineOn, type RoutineSummary } from "@rumbo/core";
import { PlayIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { Button } from "@/components/ui/button";
import { useRoutineLook } from "@/features/routines/look";
import { RoutineMenu } from "@/features/routines/RoutineMenu";
import { useRoutinePurpose } from "@/features/routines/useRoutinePurpose";
import { useStartRoutine } from "@/features/routines/useStartRoutine";
import { WeekdayChips } from "@/features/routines/WeekdayChips";

/** Una rutina en el panel: sus días y su hora; se pulsa para editarla y, si toca hoy, se puede empezar. */
export function RoutineSourceCard({
  summary,
  onEdit,
}: {
  summary: RoutineSummary;
  onEdit: () => void;
}) {
  const rumbo = useRumbo();
  const look = useRoutineLook(summary.routine);
  const purpose = useRoutinePurpose(summary);
  const start = useStartRoutine();
  const runsToday = isRoutineOn(summary.routine, rumbo.daily.today());

  return (
    <li className="flex flex-col gap-2.5 rounded-lg border bg-muted/40 p-2.5">
      <div className="flex items-center gap-2.5">
        <AreaIcon area={look} />
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          <p className="truncate text-[14.5px] font-medium">{summary.title}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">{purpose}</p>
        </button>
        <RoutineMenu summary={summary} onEdit={onEdit} />
      </div>
      <WeekdayChips schedule={summary.routine.days} />
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[13px] text-muted-foreground">
          {summary.routine.start.padStart(5, "0")} – {summary.end}
        </span>
        {runsToday && (
          <Button variant="outline" size="sm" onClick={() => void start(summary)}>
            <PlayIcon data-icon="inline-start" />
            Empezar
          </Button>
        )}
      </div>
    </li>
  );
}
