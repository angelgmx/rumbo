import { Button } from "@/components/ui/button";
import { QUICK_DURATIONS } from "./taskChoices";

function chipLabel(minutes: number): string {
  return minutes < 60 ? `${minutes} m` : `${minutes / 60} h`;
}

/** Las duraciones de siempre a un clic; pulsar la elegida la quita. */
export function DurationChips({
  value,
  onChoose,
}: {
  value: number | undefined;
  onChoose: (minutes: number | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {QUICK_DURATIONS.map((minutes) => (
        <Button
          key={minutes}
          type="button"
          size="xs"
          variant={minutes === value ? "secondary" : "outline"}
          aria-pressed={minutes === value}
          onClick={() => onChoose(minutes === value ? undefined : minutes)}
        >
          {chipLabel(minutes)}
        </Button>
      ))}
    </div>
  );
}
