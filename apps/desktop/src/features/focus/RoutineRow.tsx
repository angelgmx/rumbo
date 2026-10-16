import type { RoutineStep } from "@rumbo/core";
import { CheckCircle2Icon, ChevronDownIcon, CircleIcon } from "lucide-react";
import { useState } from "react";
import { AreaIcon } from "@/components/AreaIcon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoutineLook } from "@/features/routines/look";
import { Tag } from "@/features/roadmaps/Tag";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TimelineRow } from "./TimelineRow";
import type { RoutineGroup } from "./useFocusDay";

interface RoutineRowProps {
  group: RoutineGroup;
  time: string;
  onCompleteStep: (group: RoutineGroup, step: RoutineStep) => void;
}

/** Una rutina en «Tu día»: su hora, cuántos pasos llevas y cada paso como una ficha. */
export function RoutineRow({ group, time, onCompleteStep }: RoutineRowProps) {
  const { summary, steps } = group;
  const look = useRoutineLook(summary.routine);
  const [open, setOpen] = useState(true);
  const done = steps.filter((step) => step.done).length;

  return (
    <TimelineRow
      time={summary.routine.start}
      marker={
        <Checkbox
          checked={steps.length > 0 && done === steps.length}
          disabled
          aria-label={`${summary.title}: ${done} de ${steps.length}`}
        />
      }
    >
      <AreaIcon area={look} className="size-10" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 pt-1.5">
          <span className="font-medium">{summary.title}</span>
          {steps.length > 0 && (
            <Tag className={done === steps.length ? "text-success" : "text-warning"} dot>
              {done} de {steps.length}
            </Tag>
          )}
        </div>
        {open && steps.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {steps.map((step) => (
              <StepChip
                key={step.index}
                step={step}
                current={isCurrent(step, time)}
                onComplete={() => onCompleteStep(group, step)}
              />
            ))}
          </div>
        )}
      </div>
      <span className="pt-2.5 font-mono text-sm text-muted-foreground">
        {formatMinutes(summary.minutes)}
      </span>
      {steps.length > 0 && (
        <Button
          variant="outline"
          size="icon"
          aria-label={open ? "Ocultar pasos" : "Ver pasos"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <ChevronDownIcon className={cn("transition-transform", open && "rotate-180")} />
        </Button>
      )}
    </TimelineRow>
  );
}

function isCurrent(step: RoutineStep, time: string): boolean {
  return !step.done && step.start <= time && time < step.end;
}

function StepChip({
  step,
  current,
  onComplete,
}: {
  step: RoutineStep;
  current: boolean;
  onComplete: () => void;
}) {
  const Icon = step.done ? CheckCircle2Icon : CircleIcon;
  const canComplete = !step.done && step.completable;

  return (
    <button
      type="button"
      disabled={!canComplete}
      onClick={onComplete}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors enabled:hover:bg-muted",
        step.done && "text-muted-foreground",
        current && "border-warning/60 bg-warning/10 text-warning",
      )}
    >
      <Icon className={cn("size-4", step.done && "text-success")} />
      {step.title}
      {!step.done && ` · ${step.minutes} min`}
    </button>
  );
}
