import type { RoutineSummary } from "@rumbo/core";
import { ClockIcon } from "lucide-react";
import { Link } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { formatMinutes } from "@/lib/format";
import { BlockStrip } from "./BlockStrip";
import { ComplianceBars } from "./ComplianceBars";
import { useRoutineLook } from "./look";
import { routineHref } from "./links";
import { RoutineDayStatus } from "./RoutineDayStatus";
import { RoutineMenu } from "./RoutineMenu";
import { useRoutinePurpose } from "./useRoutinePurpose";
import { WeekdayChips } from "./WeekdayChips";

/** Una rutina en la lista: cuándo es, sus bloques y cómo se está cumpliendo. */
export function RoutineCard({ summary }: { summary: RoutineSummary }) {
  const rumbo = useRumbo();
  const look = useRoutineLook(summary.routine);
  const purpose = useRoutinePurpose(summary);
  const { routine } = summary;

  return (
    <Card className="relative gap-0 p-0 transition-shadow duration-(--dur-fast) hover:ring-1 hover:ring-border">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <AreaIcon area={look} className="size-10 rounded-xl [&_svg]:size-[18px]" />
          <div className="min-w-0 flex-1">
            <Link
              href={routineHref(summary.path)}
              className="font-medium after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
            >
              {summary.title}
            </Link>
            <p className="truncate text-sm text-muted-foreground">{purpose}</p>
          </div>
          <label className="relative z-10 flex items-center gap-2.5 text-sm">
            <span className={routine.active ? "" : "text-muted-foreground"}>
              {routine.active ? "Activa" : "Pausada"}
            </span>
            <Switch
              checked={routine.active}
              onCheckedChange={(active) => rumbo.routines.setActive(summary.path, active)}
            />
          </label>
          <RoutineMenu summary={summary} className="relative z-10 -mr-2" />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <WeekdayChips schedule={routine.days} />
          <span className="flex items-center gap-1.5 font-mono">
            <ClockIcon className="size-3.5 text-muted-foreground" />
            {routine.start} – {summary.end}
          </span>
          <span className="text-muted-foreground">
            {formatMinutes(summary.minutes)} · {summary.blocks.length} bloques
          </span>
        </div>

        <BlockStrip blocks={routine.blocks} routineColor={look.color} labeled />
      </div>

      <div className="flex h-14 items-center justify-between border-t px-5">
        <ComplianceBars weeks={summary.weeks} />
        <RoutineDayStatus summary={summary} />
      </div>
    </Card>
  );
}
