import type { Energy } from "@rumbo/core";
import { cn } from "@/lib/utils";
import { StepCard } from "./StepCard";

const LEVELS: { value: Energy; label: string; description: string; bars: number }[] = [
  { value: "low", label: "Baja", description: "me ha costado", bars: 1 },
  { value: "medium", label: "Media", description: "normal", bars: 2 },
  { value: "high", label: "Alta", description: "con ganas", bars: 3 },
];

/** Paso 2: cómo ha ido la energía, para saber más adelante a qué hora rindes mejor. */
export function EnergyStep({
  value,
  onChange,
}: {
  value?: Energy;
  onChange: (energy: Energy) => void;
}) {
  return (
    <StepCard number={2} title="¿Qué tal tu energía hoy?" hint="para saber a qué hora rindes mejor">
      <div role="radiogroup" aria-label="Energía" className="grid grid-cols-3 gap-3">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            role="radio"
            aria-checked={value === level.value}
            onClick={() => onChange(level.value)}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-(--dur-fast) hover:bg-muted",
              value === level.value && "border-primary bg-primary-soft",
            )}
          >
            <EnergyBars filled={level.bars} active={value === level.value} />
            <span>
              <span className="block font-medium">{level.label}</span>
              <span className="text-sm text-muted-foreground">{level.description}</span>
            </span>
          </button>
        ))}
      </div>
    </StepCard>
  );
}

function EnergyBars({ filled, active }: { filled: number; active: boolean }) {
  return (
    <span className="flex h-5 items-end gap-0.5" aria-hidden>
      {[2, 3, 5].map((height, index) => (
        <span
          key={height}
          className={cn(
            "w-1.5 rounded-sm bg-muted",
            index < filled && (active ? "bg-primary" : "bg-muted-foreground"),
          )}
          style={{ height: height * 4 }}
        />
      ))}
    </span>
  );
}
