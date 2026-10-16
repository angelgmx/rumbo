import type { GoalInput, GoalStatus, GoalSummary } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { STATUS_LABEL, STATUS_ORDER } from "../goalLabels";
import { GoalStatusTag } from "../GoalStatusTag";
import { AreaRow, PeriodRow } from "../propertyRows";
import { GoalDatesRow } from "./GoalDatesRow";

/** Las propiedades del objetivo, como en Notion: cada valor se cambia donde se lee. */
export function GoalProperties({ summary }: { summary: GoalSummary }) {
  const rumbo = useRumbo();
  const { id, goal } = summary;
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
      <GoalDatesRow start={goal.start} deadline={goal.deadline} onChange={change} />
    </section>
  );
}
