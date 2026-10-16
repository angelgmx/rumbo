import { addMinutesToTime } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { DaysField } from "@/components/panel/DaysField";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow, ReadOnlyRow } from "@/components/panel/PropertyRow";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Input } from "@/components/ui/input";
import type { RoutineDraft } from "./useRoutineDraft";

/** Días, hora, área y la ruta que avanza: una fila cada una, como en el panel de tareas. */
export function RoutineProperties({
  draft,
  minutes,
  withRoadmap,
  onChange,
}: {
  draft: RoutineDraft;
  minutes: number;
  /** Solo si tiene bloques de tema: son los que avanzan la ruta. */
  withRoadmap: boolean;
  onChange: (changes: Partial<RoutineDraft>) => void;
}) {
  const rumbo = useRumbo();
  const areas = rumbo.store.notesOfType("area").map((note) => String(note.data.name ?? note.name));
  const roadmaps = rumbo.learning
    .roadmaps()
    .map((roadmap) => ({ value: roadmap.name, label: roadmap.title }));

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
                · termina {addMinutesToTime(draft.start, minutes)}
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
      {withRoadmap && (
        <PropertyRow
          label="Ruta"
          empty="Sin ruta"
          value={roadmaps.find((roadmap) => roadmap.value === draft.roadmap)?.label}
          width="w-64"
        >
          {(close) => (
            <OptionList
              options={roadmaps}
              value={draft.roadmap}
              clearLabel="Sin ruta"
              onChoose={(roadmap) => {
                onChange({ roadmap });
                close();
              }}
            />
          )}
        </PropertyRow>
      )}
    </section>
  );
}
