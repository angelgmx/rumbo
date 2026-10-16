import type { GoalInput, GoalSummary } from "@rumbo/core";
import { CalendarIcon, FlagIcon, LayoutGridIcon, PlayIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { DateRow } from "@/components/panel/DateRow";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { PRIORITIES } from "@/features/task-panel/taskChoices";
import { FLAG_COLOR, PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { cn } from "@/lib/utils";
import { AreaRow } from "../propertyRows";

/** Área, inicio, fecha límite y prioridad: cada valor se cambia donde se lee. */
export function GoalProperties({ summary: { id, goal } }: { summary: GoalSummary }) {
  const rumbo = useRumbo();
  const change = (changes: Partial<GoalInput>) => void rumbo.goals.update(id, changes);

  return (
    <section aria-label="Propiedades" className="flex flex-col">
      <AreaRow icon={LayoutGridIcon} area={goal.area} onChange={change} />
      <DateRow
        icon={PlayIcon}
        label="Inicio"
        empty="Sin inicio"
        date={goal.start}
        onChange={(start) => change({ start })}
      />
      <DateRow
        icon={CalendarIcon}
        label="Fecha límite"
        empty="Sin fecha límite"
        date={goal.deadline}
        onChange={(deadline) => change({ deadline })}
      />
      <PropertyRow
        icon={FlagIcon}
        label="Prioridad"
        empty="Sin prioridad"
        value={
          goal.priority && (
            <>
              <FlagIcon className={cn("size-4 fill-current", FLAG_COLOR[goal.priority])} />
              {PRIORITY_LABEL[goal.priority]}
            </>
          )
        }
        width="w-48"
      >
        {(close) => (
          <OptionList
            options={PRIORITIES}
            value={goal.priority}
            clearLabel="Sin prioridad"
            onChoose={(priority) => {
              change({ priority: priority as GoalInput["priority"] });
              close();
            }}
          />
        )}
      </PropertyRow>
    </section>
  );
}
