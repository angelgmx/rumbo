import type { GoalInput, GoalStatus, GoalSummary } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow, ReadOnlyRow } from "@/components/panel/PropertyRow";
import { STATUS_LABEL, STATUS_ORDER } from "../goalLabels";
import { GoalProgress } from "../GoalProgress";
import { GoalStatusTag } from "../GoalStatusTag";
import { AreaRow, DateRow, PeriodRow } from "../propertyRows";

/** Las propiedades del objetivo, como en Notion: cada valor se cambia donde se lee. */
export function GoalProperties({ summary }: { summary: GoalSummary }) {
  const rumbo = useRumbo();
  const { id, goal, progress } = summary;
  const change = (changes: Partial<GoalInput>) => void rumbo.goals.update(id, changes);

  return (
    <section className="-ml-2 flex flex-col" aria-label="Propiedades">
      <PropertyRow label="Estado" value={<GoalStatusTag status={goal.status} />} width="w-48">
        {(close) => (
          <OptionList
            options={STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABEL[status] }))}
            value={goal.status}
            onChoose={(status) => {
              if (status) void rumbo.goals.setStatus(id, status as GoalStatus);
              close();
            }}
          />
        )}
      </PropertyRow>
      <AreaRow area={goal.area} onChange={change} />
      <PeriodRow period={goal.period} onChange={change} />
      <DateRow
        label="Inicio"
        empty="Sin inicio"
        date={goal.start}
        onChange={(start) => change({ start })}
      />
      <DateRow
        label="Fecha límite"
        empty="Sin fecha"
        date={goal.deadline}
        onChange={(deadline) => change({ deadline })}
      />
      <ReadOnlyRow label="Progreso">
        <GoalProgress progress={progress} />
      </ReadOnlyRow>
    </section>
  );
}
