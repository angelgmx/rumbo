import type { GoalStatus, GoalSummary } from "@rumbo/core";
import { ClockIcon, PencilIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { InlineTitle } from "@/components/InlineTitle";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { useArea } from "@/hooks/useArea";
import { daysChipLabel, STATUS_LABEL, STATUS_ORDER } from "../goalLabels";
import { GoalStatusTag } from "../GoalStatusTag";

/** El icono de su área, el título que se edita en su sitio, el estado y los días que quedan. */
export function GoalTitle({ summary: { id, goal, daysLeft } }: { summary: GoalSummary }) {
  const rumbo = useRumbo();
  const area = useArea(goal.area);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <AreaIcon
          area={{ ...area, icon: area.icon ?? "target" }}
          className="size-10 rounded-xl [&_svg]:size-5"
        />
        <InlineTitle
          label="Título del objetivo"
          value={goal.title}
          onSave={(title) => void rumbo.goals.update(id, { title })}
          className="min-w-0 px-1 py-0.5 text-2xl font-semibold tracking-tight"
        />
        <PencilIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PropertyPopover
          label="Estado"
          width="w-48"
          className="rounded-md"
          trigger={<GoalStatusTag status={goal.status} />}
        >
          {(close) => (
            <OptionList
              options={STATUS_ORDER.map((status) => ({
                value: status,
                label: STATUS_LABEL[status],
              }))}
              value={goal.status}
              onChoose={(status) => {
                if (status) void rumbo.goals.setStatus(id, status as GoalStatus);
                close();
              }}
            />
          )}
        </PropertyPopover>
        {goal.status === "active" && daysLeft !== undefined && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ClockIcon className="size-4" />
            {daysChipLabel(daysLeft)}
          </span>
        )}
      </div>
    </div>
  );
}
