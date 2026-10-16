import { addDays, type IsoDate } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDay } from "@/lib/format";

// Duraciones típicas de un reto: 66 días es lo que tarda de media un hábito en volverse automático.
const PRESETS = [21, 30, 66, 90];

interface ChallengePickerProps {
  /** Desde cuándo cuenta el hábito (hoy, si es nuevo). */
  started: IsoDate;
  until?: IsoDate;
  onChange: (until: IsoDate | undefined) => void;
}

/** Siempre, o un reto con un número de días y su fecha de fin. */
export function ChallengePicker({ started, until, onChange }: ChallengePickerProps) {
  const days = until ? daysInclusive(started, until) : undefined;
  const setDays = (count: number) => onChange(count > 0 ? addDays(started, count - 1) : undefined);

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        variant="outline"
        className="w-full"
        value={[until ? "challenge" : "forever"]}
        onValueChange={(values) => {
          if (values[0] === "forever") onChange(undefined);
          if (values[0] === "challenge" && !until) setDays(66);
        }}
      >
        <ToggleGroupItem value="forever" className="flex-1">
          Siempre
        </ToggleGroupItem>
        <ToggleGroupItem value="challenge" className="flex-1">
          <FlagIcon data-icon="inline-start" />
          Un reto con fin
        </ToggleGroupItem>
      </ToggleGroup>

      {until && days !== undefined && (
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            variant="outline"
            value={PRESETS.includes(days) ? [String(days)] : []}
            onValueChange={(values) => values[0] && setDays(Number(values[0]))}
          >
            {PRESETS.map((preset) => (
              <ToggleGroupItem key={preset} value={String(preset)}>
                {preset} días
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Input
            type="number"
            min={1}
            className="w-20"
            aria-label="Días del reto"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          />
          <Badge variant="secondary">termina el {formatDay(until)}</Badge>
        </div>
      )}
    </div>
  );
}

function daysInclusive(from: IsoDate, to: IsoDate): number {
  let count = 1;
  for (let day = from; day < to; day = addDays(day, 1)) count++;
  return count;
}
