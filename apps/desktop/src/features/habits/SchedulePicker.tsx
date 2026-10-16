import type { HabitSchedule, Weekday } from "@rumbo/core";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Frequency = "daily" | "days" | "weekly";

const WEEKDAYS: { value: Weekday; label: string; name: string }[] = [
  { value: "mon", label: "L", name: "lunes" },
  { value: "tue", label: "M", name: "martes" },
  { value: "wed", label: "X", name: "miércoles" },
  { value: "thu", label: "J", name: "jueves" },
  { value: "fri", label: "V", name: "viernes" },
  { value: "sat", label: "S", name: "sábado" },
  { value: "sun", label: "D", name: "domingo" },
];

/** Qué días toca el hábito: todos, unos concretos o N veces por semana. */
export function SchedulePicker({
  value,
  onChange,
}: {
  value: HabitSchedule;
  onChange: (schedule: HabitSchedule) => void;
}) {
  const frequency: Frequency =
    value === "daily" ? "daily" : Array.isArray(value) ? "days" : "weekly";
  const days = Array.isArray(value) ? value : [];
  const timesPerWeek =
    typeof value === "object" && !Array.isArray(value) ? value.times_per_week : 3;

  function changeFrequency(next: Frequency) {
    if (next === "daily") onChange("daily");
    if (next === "days") onChange(days.length > 0 ? days : ["mon", "wed", "fri"]);
    if (next === "weekly") onChange({ times_per_week: timesPerWeek });
  }

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        variant="outline"
        className="w-full"
        value={[frequency]}
        onValueChange={(values) => values[0] && changeFrequency(values[0] as Frequency)}
      >
        <ToggleGroupItem value="daily" className="flex-1">
          Todos los días
        </ToggleGroupItem>
        <ToggleGroupItem value="days" className="flex-1">
          Días concretos
        </ToggleGroupItem>
        <ToggleGroupItem value="weekly" className="flex-1">
          Veces por semana
        </ToggleGroupItem>
      </ToggleGroup>

      {frequency === "days" && (
        <div className="flex gap-2">
          {WEEKDAYS.map((day) => {
            const selected = days.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                aria-pressed={selected}
                aria-label={day.name}
                onClick={() =>
                  onChange(selected ? days.filter((d) => d !== day.value) : [...days, day.value])
                }
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border text-sm font-medium transition-all duration-(--dur-fast) hover:bg-muted active:scale-95",
                  selected && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      )}

      {frequency === "weekly" && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Menos"
            disabled={timesPerWeek <= 1}
            onClick={() => onChange({ times_per_week: timesPerWeek - 1 })}
          >
            <MinusIcon />
          </Button>
          <span className="w-6 text-center font-mono text-lg">{timesPerWeek}</span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Más"
            disabled={timesPerWeek >= 7}
            onClick={() => onChange({ times_per_week: timesPerWeek + 1 })}
          >
            <PlusIcon />
          </Button>
          <span className="text-sm text-muted-foreground">
            veces por semana, el día que te venga mejor
          </span>
        </div>
      )}
    </div>
  );
}
