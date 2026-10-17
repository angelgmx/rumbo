import { addDays, type Energy } from "@rumbo/core";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { dayCount } from "@/features/focus/dayCount";
import { useFocusDay } from "@/features/focus/useFocusDay";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { CloseDayHeading } from "./CloseDayHeading";
import { EnergyStep } from "./EnergyStep";
import { HabitsStep } from "./HabitsStep";
import { TomorrowStep } from "./TomorrowStep";
import { WinsStep } from "./WinsStep";

/** Cerrar el día: hábitos, energía, lo que salió bien y cómo arranca mañana. */
export function CloseDayScreen() {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const today = rumbo.daily.today();
  const day = useFocusDay(today);
  const { done, total } = dayCount(day);
  const [starts] = useState(() => rumbo.closeDay.tomorrowStarts());

  const [energy, setEnergy] = useState<Energy | undefined>(() => rumbo.closeDay.energy());
  // Lo que propone Rumbo sigue a los datos (marcar un hábito arriba lo añade) hasta que lo tocas.
  const liveWins = useVaultQuery((r) => r.closeDay.wins()).data ?? [];
  const [editedWins, setWins] = useState<string[]>();
  const wins = editedWins ?? liveWins;
  const [start, setStart] = useState(starts[0] ?? "");
  const [editedStep, setFirstStep] = useState<string>();
  const firstStep =
    editedStep ?? (day.nextStep ? `Abre ${day.nextStep.module} y lee 1 minuto` : "");

  async function close() {
    try {
      await rumbo.closeDay.close({
        energy,
        wins: wins.map((win) => win.trim()).filter(Boolean),
        tomorrow: start ? { start, firstStep } : undefined,
      });
      toast.success("Día cerrado. Hasta mañana.");
      navigate("/");
    } catch {
      toast.error("No se ha podido guardar el cierre");
    }
  }

  return (
    <>
      <ScreenHeader
        newTask={false}
        title={
          <span className="flex items-center gap-1.5 text-muted-foreground">
            Foco
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">Cerrar el día</span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" render={<Link href="/" />}>
              Ahora no
            </Button>
            <Button onClick={close}>
              <CheckIcon data-icon="inline-start" />
              Cerrar el día
            </Button>
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <CloseDayHeading today={today} done={done} total={total} />
          <HabitsStep habits={day.habits} />
          <EnergyStep value={energy} onChange={setEnergy} />
          <WinsStep wins={wins} onChange={setWins} />
          <TomorrowStep
            tomorrow={addDays(today, 1)}
            starts={starts}
            start={start}
            firstStep={firstStep}
            onStartChange={setStart}
            onFirstStepChange={setFirstStep}
          />
        </div>
      </main>
    </>
  );
}
