import { isRoutineOn, type RoutineSummary } from "@rumbo/core";
import { PlusIcon, RepeatIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { RoutineCard } from "./RoutineCard";
import { TemplateGallery } from "./TemplateGallery";
import { TodayCard } from "./TodayCard";
import { RoutinePanel } from "./panel/RoutinePanel";
import type { Start } from "./panel/useRoutineDraft";

const ALL_AREAS = "all";

/** Rutinas: lo que haces cada día y a qué hora. Cada bloque marca un hábito o avanza un tema. */
export function RoutinesScreen() {
  const rumbo = useRumbo();
  const list = useVaultQuery((r) => r.routines.list()).data;
  const [area, setArea] = useState(ALL_AREAS);
  const [creating, setCreating] = useState<Start>();

  const header = (
    <>
      <ScreenHeader
        title="Rutinas"
        newTask={false}
        actions={
          <Button onClick={() => setCreating("blank")}>
            <PlusIcon data-icon="inline-start" />
            Nueva rutina
          </Button>
        }
      />
      <RoutinePanel from={creating} onClose={() => setCreating(undefined)} />
    </>
  );
  if (!list) return header;

  const today = rumbo.daily.today();
  const routines = list;
  const areas = [...new Set(routines.map(areaOf).filter((name) => name !== undefined))];
  const visible = area === ALL_AREAS ? routines : routines.filter((r) => areaOf(r) === area);
  const todays = routines.filter((summary) => isRoutineOn(summary.routine, today));
  const others = routines.filter(
    (summary) => summary.routine.active && !isRoutineOn(summary.routine, today),
  );

  return (
    <>
      {header}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Rutinas</h1>
              <p className="mt-1 text-muted-foreground">
                Lo que haces cada día y a qué hora. Cada bloque marca un hábito o avanza un tema.
              </p>
            </div>
            {areas.length > 0 && (
              <SegmentedControl
                label="Área"
                options={[
                  { value: ALL_AREAS, label: "Todas" },
                  ...areas.map((name) => ({ value: name, label: name })),
                ]}
                value={area}
                onChange={setArea}
              />
            )}
          </div>

          {routines.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <RepeatIcon />
                </EmptyMedia>
                <EmptyTitle>Todavía no tienes rutinas</EmptyTitle>
                <EmptyDescription>
                  Una rutina pone en orden y a su hora tus hábitos, tus temas y tus tareas. Empieza
                  con una plantilla.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <TodayCard date={today} today={todays} other={others} />
              <div className="grid grid-cols-2 gap-4">
                {visible.map((summary) => (
                  <RoutineCard key={summary.id} summary={summary} />
                ))}
              </div>
            </>
          )}

          <TemplateGallery onPick={setCreating} />
        </div>
      </main>
    </>
  );
}

function areaOf(summary: RoutineSummary): string | undefined {
  return summary.routine.area;
}
