import { Input } from "@/components/ui/input";
import { formatLongDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StepCard } from "./StepCard";

/** Paso 4: a qué hora empiezas mañana y lo primero, tan pequeño que no cueste. */
export function TomorrowStep({
  tomorrow,
  starts,
  start,
  firstStep,
  onStartChange,
  onFirstStepChange,
}: {
  tomorrow: string;
  /** Horas de las rutinas de mañana, para elegirlas de un toque. */
  starts: string[];
  start: string;
  firstStep: string;
  onStartChange: (start: string) => void;
  onFirstStepChange: (text: string) => void;
}) {
  return (
    <StepCard number={4} title="Mañana, ¿a qué hora empiezas?" aside={formatLongDay(tomorrow)}>
      <div className="flex flex-wrap items-center gap-2">
        {starts.map((time) => (
          <button
            key={time}
            type="button"
            aria-pressed={start === time}
            onClick={() => onStartChange(time)}
            className={cn(
              "h-10 rounded-lg border px-4 font-mono text-sm transition-colors duration-(--dur-fast) hover:bg-muted",
              start === time &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary",
            )}
          >
            {time}
          </button>
        ))}
        <Input
          type="time"
          value={start}
          onChange={(event) => onStartChange(event.target.value)}
          aria-label="Otra hora"
          className="h-10 w-32 font-mono"
        />
      </div>
      <label className="flex flex-col gap-1 rounded-lg border px-4 py-3">
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Lo primero, solo esto
        </span>
        <input
          value={firstStep}
          onChange={(event) => onFirstStepChange(event.target.value)}
          placeholder="Algo de un par de minutos para arrancar"
          className="bg-transparent font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
        />
      </label>
    </StepCard>
  );
}
