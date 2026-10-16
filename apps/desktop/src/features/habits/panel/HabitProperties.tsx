import type { HabitInput, IsoDate } from "@rumbo/core";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useRumbo } from "@/app/RumboContext";
import { ColorSwatches, IconGrid } from "@/components/LookOptions";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow, ReadOnlyRow } from "@/components/panel/PropertyRow";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Button } from "@/components/ui/button";
import { formatDayMonth } from "@/lib/format";
import { ChallengePicker } from "../ChallengePicker";
import { TimeRangePicker } from "../TimeRangePicker";
import { DaysField } from "@/components/panel/DaysField";

/** Las propiedades del hábito, una fila cada una, como en el panel de tareas. */
export function HabitProperties({
  draft,
  started,
  onChange,
}: {
  draft: HabitInput;
  /** Desde cuándo cuenta el hábito, para saber cuándo acaba un reto. */
  started: IsoDate;
  onChange: (changes: Partial<HabitInput>) => void;
}) {
  const { store, goals: goalService } = useRumbo();
  const areas = store.notesOfType("area").map((note) => String(note.data.name ?? note.name));
  const goals = goalService
    .list()
    .map(({ id, goal }) => ({ value: String(id), label: goal.title }));

  return (
    <section className="flex flex-col">
      <div className="mb-1">
        <SectionLabel>Propiedades</SectionLabel>
      </div>
      <ReadOnlyRow label="Días">
        <DaysField value={draft.schedule} onChange={(schedule) => onChange({ schedule })} />
      </ReadOnlyRow>
      <PropertyRow
        label="Hora"
        empty="Sin hora"
        value={draft.start && draft.end && `${draft.start} → ${draft.end}`}
        width="w-auto p-3"
      >
        {(close) => (
          <div className="flex flex-col gap-3">
            <TimeRangePicker
              value={{ start: draft.start ?? "07:00", end: draft.end ?? "08:00" }}
              onChange={(range) => onChange(range)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => {
                onChange({ start: undefined, end: undefined });
                close();
              }}
            >
              Sin hora
            </Button>
          </div>
        )}
      </PropertyRow>
      <PropertyRow label="Área" empty="Sin área" value={draft.area} width="w-60">
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
      <PropertyRow
        label="Objetivo"
        empty="Sin objetivo"
        value={goals.find((goal) => goal.value === draft.goalId?.toString())?.label}
        width="w-64"
      >
        {(close) => (
          <OptionList
            options={goals}
            value={draft.goalId?.toString()}
            clearLabel="Sin objetivo"
            onChoose={(goal) => {
              onChange({ goalId: goal ? Number(goal) : undefined });
              close();
            }}
          />
        )}
      </PropertyRow>
      <PropertyRow
        label="Duración"
        value={draft.until ? `Reto hasta el ${formatDayMonth(draft.until)}` : "Siempre"}
        width="w-[26rem] p-3"
      >
        {() => (
          <ChallengePicker
            started={started}
            until={draft.until}
            onChange={(until) => onChange({ until })}
          />
        )}
      </PropertyRow>
      <ReadOnlyRow label="Color">
        <ColorSwatches value={draft.color} onChange={(color) => onChange({ color })} />
      </ReadOnlyRow>
      <PropertyRow
        label="Icono"
        empty="El de su área"
        value={draft.icon && <DynamicIcon name={draft.icon as IconName} className="size-4" />}
        width="w-auto p-1"
      >
        {(close) => (
          <IconGrid
            value={draft.icon}
            onChange={(icon) => {
              onChange({ icon });
              close();
            }}
          />
        )}
      </PropertyRow>
    </section>
  );
}
