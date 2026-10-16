import { isRoutineOn, linkTarget, type RoutineSummary } from "@rumbo/core";
import { PlusIcon, RepeatIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { routineHref } from "./links";
import { RoutineCard } from "./RoutineCard";
import { TemplateGallery } from "./TemplateGallery";
import { TodayCard } from "./TodayCard";

const ALL_AREAS = "all";

/** Rutinas: lo que haces cada día y a qué hora. Cada bloque marca un hábito o avanza un tema. */
export function RoutinesScreen() {
  const rumbo = useRumbo();
  const list = useVaultQuery((r) => r.routines.list()).data;
  const [area, setArea] = useState(ALL_AREAS);

  const header = <ScreenHeader title="Rutinas" actions={<NewRoutineButton />} />;
  if (!list) return header;

  const today = rumbo.daily.today();
  const { routines, invalid } = list;
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
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Rutinas</h1>
              <p className="mt-1 text-muted-foreground">
                Lo que haces cada día y a qué hora. Cada bloque marca un hábito o avanza un tema.
              </p>
            </div>
            {areas.length > 0 && (
              <ToggleGroup
                variant="outline"
                size="sm"
                value={[area]}
                onValueChange={(values) => values[0] && setArea(values[0])}
              >
                <ToggleGroupItem value={ALL_AREAS}>Todas</ToggleGroupItem>
                {areas.map((name) => (
                  <ToggleGroupItem key={name} value={name}>
                    {name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          </div>

          {invalid.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Hay rutinas que no se pueden leer</AlertTitle>
              <AlertDescription>Revisa el frontmatter de: {invalid.join(", ")}</AlertDescription>
            </Alert>
          )}

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
                  <RoutineCard key={summary.path} summary={summary} />
                ))}
              </div>
            </>
          )}

          <TemplateGallery />
        </div>
      </main>
    </>
  );
}

/** Crea una rutina en blanco y abre su editor para ponerle nombre y bloques. */
function NewRoutineButton() {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();

  async function create() {
    const path = await rumbo.routines.create({ title: "Nueva rutina", start: "18:00" });
    toast.success("Rutina creada: ponle nombre y bloques");
    navigate(routineHref(path));
  }

  return (
    <Button variant="outline" onClick={create}>
      <PlusIcon data-icon="inline-start" />
      Nueva rutina
    </Button>
  );
}

function areaOf(summary: RoutineSummary): string | undefined {
  return linkTarget(summary.routine.area);
}
