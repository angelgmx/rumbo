import type { CalendarEvent, IsoDate, RoutineStep, RoutineSummary } from "@rumbo/core";
import { CheckIcon, RepeatIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useRumbo } from "@/app/RumboContext";
import { Checkbox } from "@/components/ui/checkbox";
import { timeOf, useNow } from "@/hooks/useNow";
import { useRoutineLook } from "@/features/routines/look";
import { cn } from "@/lib/utils";
import { tint } from "./tint";
import { TimePill } from "./TimePill";

type RoutineCalendarEvent = Extract<CalendarEvent, { kind: "routine" }>;

// Con menos alto que esto la rutina es una sola fila con su cuenta.
const FULL_MIN_HEIGHT = 56;

/**
 * Una rutina: banda con rayado suave y borde discontinuo. Hoy deja marcar sus pasos ahí mismo;
 * otro día solo cuenta cuántos se hicieron.
 */
export function RoutineEvent({
  event,
  date,
  today,
  height,
  onOpen,
}: {
  event: RoutineCalendarEvent;
  date: IsoDate;
  today: IsoDate;
  height: number;
  onOpen: () => void;
}) {
  const { summary, steps } = event;
  const look = useRoutineLook(summary.routine);
  const done = steps.filter((step) => step.done).length;
  const compact = height < FULL_MIN_HEIGHT || steps.length === 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(key) => key.key === "Enter" && onOpen()}
      className="h-full cursor-pointer overflow-hidden rounded-md border border-dashed px-2 py-1 text-left"
      style={{
        borderColor: tint(look.color, 70),
        backgroundColor: tint(look.color, 8),
        backgroundImage: `repeating-linear-gradient(135deg, ${tint(look.color, 14)} 0 5px, transparent 5px 10px)`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="flex size-4 shrink-0 [&_svg]:size-4" style={{ color: look.color }}>
          {look.icon ? (
            <DynamicIcon name={look.icon as IconName} fallback={DefaultIcon} />
          ) : (
            <RepeatIcon />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] leading-[18px] font-medium">
          {summary.title}
        </span>
        {compact && steps.length > 0 && (
          <span className="font-mono text-[13px] text-muted-foreground">
            {done}/{steps.length}
          </span>
        )}
      </div>
      {!compact && (
        <>
          <div className="mt-1">
            <TimePill start={event.start} end={event.end} color={look.color} />
          </div>
          {date === today ? (
            <StepList summary={summary} steps={steps} color={look.color} />
          ) : (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              {done === steps.length && <CheckIcon className="size-3.5 text-success" />}
              {done} de {steps.length} hechos
            </p>
          )}
        </>
      )}
    </div>
  );
}

function StepList({
  summary,
  steps,
  color,
}: {
  summary: RoutineSummary;
  steps: RoutineStep[];
  color: string;
}) {
  const rumbo = useRumbo();
  const time = timeOf(useNow());

  return (
    <ul className="mt-1.5 flex flex-col gap-0.5" onClick={(click) => click.stopPropagation()}>
      {steps.map((step) => {
        const current = !step.done && step.start <= time && time < step.end;
        return (
          <li key={step.index} className="flex items-center gap-1.5 text-[12.5px] leading-4">
            <Checkbox
              checked={step.done}
              disabled={!step.completable}
              aria-label={step.title}
              className="size-3.5"
              style={step.done ? { backgroundColor: color, borderColor: color } : undefined}
              onCheckedChange={() => void rumbo.routines.completeBlock(summary, step.index)}
            />
            <span
              className={cn(
                "truncate",
                step.done && "text-muted-foreground",
                current && "font-semibold text-primary-text",
              )}
            >
              {step.title}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function DefaultIcon() {
  return <RepeatIcon />;
}
