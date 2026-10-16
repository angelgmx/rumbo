import { addMinutesToTime } from "@rumbo/core";
import { DaysField } from "@/components/panel/DaysField";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow, ReadOnlyRow } from "@/components/panel/PropertyRow";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AreaDot } from "@/features/tasks/AreaDot";
import { useAreaNames } from "@/hooks/useAreaNames";
import { formatMinutes } from "@/lib/format";
import { GoalProperty } from "./GoalProperty";
import { HabitProperty } from "./HabitProperty";
import type { RoutineDraft } from "./useRoutineDraft";
import { ValidityProperty } from "./ValidityProperty";

/** Las propiedades de la rutina, una fila cada una, como en el panel de tareas. */
export function RoutineProperties({
  draft,
  minutes,
  onChange,
}: {
  draft: RoutineDraft;
  /** Lo que suman los bloques: con él se calcula la hora de fin. */
  minutes: number;
  onChange: (changes: Partial<RoutineDraft>) => void;
}) {
  const areas = useAreaNames();

  return (
    <section className="flex flex-col">
      <div className="mb-1">
        <SectionLabel>Propiedades</SectionLabel>
      </div>
      <ReadOnlyRow label="Días">
        <DaysField value={draft.days} perWeek={false} onChange={(days) => onChange({ days })} />
      </ReadOnlyRow>
      <PropertyRow
        label="Empieza"
        value={
          <span className="font-mono">
            {draft.start}
            {minutes > 0 && (
              <span className="font-sans text-muted-foreground">
                {" "}
                · termina {addMinutesToTime(draft.start, minutes)} ({formatMinutes(minutes)})
              </span>
            )}
          </span>
        }
        width="w-auto p-2"
      >
        {() => (
          <Input
            type="time"
            aria-label="Hora de inicio"
            className="w-32"
            value={draft.start}
            onChange={(event) => event.target.value && onChange({ start: event.target.value })}
          />
        )}
      </PropertyRow>
      <ValidityProperty from={draft.from} until={draft.until} onChange={onChange} />
      <GoalProperty goalId={draft.goalId} onChange={(goalId) => onChange({ goalId })} />
      <HabitProperty habit={draft.habit} onChange={(habit) => onChange({ habit })} />
      <PropertyRow
        label="Área"
        empty="Sin área"
        value={
          draft.area && (
            <>
              <AreaDot area={draft.area} />
              {draft.area}
            </>
          )
        }
        width="w-60"
      >
        {(close) => (
          <OptionList
            options={areas.map((area) => ({ value: area, label: area }))}
            value={draft.area}
            clearLabel="Sin área"
            onChoose={(area) => {
              onChange({ area });
              close();
            }}
          />
        )}
      </PropertyRow>
      <ReadOnlyRow label="Activa">
        <Switch
          checked={draft.active}
          onCheckedChange={(active) => onChange({ active })}
          aria-label="Activa"
        />
      </ReadOnlyRow>
    </section>
  );
}
