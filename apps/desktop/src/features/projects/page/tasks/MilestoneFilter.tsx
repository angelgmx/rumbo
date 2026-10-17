import type { Milestone } from "@rumbo/core";
import { ChevronDownIcon, FunnelIcon } from "lucide-react";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";

/** «Hito: todos ⌄»: deja solo las tareas de un hito. Sin hitos, no sale. */
export function MilestoneFilter({
  milestones,
  value,
  onChange,
}: {
  milestones: Milestone[];
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  if (milestones.length === 0) return null;
  const chosen = milestones.find(({ id }) => id === value);

  return (
    <PropertyPopover
      label="Filtrar por hito"
      width="w-64"
      className="h-8 rounded-lg border px-3"
      trigger={
        <>
          <FunnelIcon className="size-3.5 text-muted-foreground" />
          <span>
            Hito: <span className="font-medium">{chosen ? chosen.title : "todos"}</span>
          </span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </>
      }
    >
      {(close) => (
        <OptionList
          options={milestones.map(({ id, title }) => ({ value: String(id), label: title }))}
          value={value === undefined ? undefined : String(value)}
          clearLabel="Todos"
          onChoose={(next) => {
            onChange(next === undefined ? undefined : Number(next));
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
