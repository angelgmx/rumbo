import type { RoutineSummary } from "@rumbo/core";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  CalendarXIcon,
  CheckIcon,
  ClockIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/format";
import { BlockStrip } from "../BlockStrip";
import { WEEKDAY_LETTER } from "../WeekdayChips";

/** Resumen: cuánto dura, qué hábitos marca, qué temas avanza y si se pisa con otra rutina. */
export function RoutineOverview({ summary, color }: { summary: RoutineSummary; color: string }) {
  const rumbo = useRumbo();
  const modules = summary.routine.blocks
    .filter((block) => block.kind === "module")
    .map((block) => rumbo.routines.moduleFor(block)?.module)
    .filter((module) => module !== undefined);
  const uniqueModules = [...new Map(modules.map((module) => [module.path, module])).values()];

  return (
    <Card className="gap-4 p-5">
      <h2 className="flex items-center gap-2 font-medium">
        <ClockIcon className="size-4 text-muted-foreground" />
        Resumen
      </h2>
      <p className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight">
          {formatMinutes(summary.minutes)}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
          {summary.routine.start}
          <ArrowRightIcon className="size-3.5" />
          {summary.end}
        </span>
      </p>
      <BlockStrip blocks={summary.routine.blocks} routineColor={color} />

      <ul className="flex flex-col gap-2.5 text-sm">
        {summary.habits.map(({ habit }) => (
          <Fact key={habit.key} icon={<CheckIcon className="text-success" />}>
            Marca el hábito {habit.name}
          </Fact>
        ))}
        {uniqueModules.map((module) => (
          <Fact key={module.path} icon={<BookOpenIcon className="text-primary-text" />}>
            {module.status === "not-started"
              ? `${module.title} pasa a «aprendiendo»`
              : `Sigue con ${module.title}`}
          </Fact>
        ))}
        {summary.clashes.length === 0 ? (
          <Fact icon={<CalendarCheckIcon className="text-success" />}>
            Sin choques con otras rutinas
          </Fact>
        ) : (
          summary.clashes.map((clash) => (
            <Fact key={clash.title} icon={<CalendarXIcon className="text-warning" />}>
              Choca con {clash.title} el {clash.days.map((day) => WEEKDAY_LETTER[day]).join(" ")}
            </Fact>
          ))
        )}
      </ul>
    </Card>
  );
}

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 [&>svg]:size-4 [&>svg]:shrink-0">
      {icon}
      <span>{children}</span>
    </li>
  );
}
