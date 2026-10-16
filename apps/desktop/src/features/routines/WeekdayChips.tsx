import { WEEKDAYS, type HabitSchedule, type Weekday } from "@rumbo/core";
import { cn } from "@/lib/utils";

export const WEEKDAY_LETTER: Record<Weekday, string> = {
  mon: "L",
  tue: "M",
  wed: "X",
  thu: "J",
  fri: "V",
  sat: "S",
  sun: "D",
};

export const WEEKDAY_NAME: Record<Weekday, string> = {
  mon: "lunes",
  tue: "martes",
  wed: "miércoles",
  thu: "jueves",
  fri: "viernes",
  sat: "sábado",
  sun: "domingo",
};

interface WeekdayChipsProps {
  schedule: HabitSchedule;
  /** Con él, los días se pueden marcar y desmarcar. */
  onChange?: (days: Weekday[]) => void;
}

/** L M X J V S D: los días que toca, rellenos suaves; los demás, solo la letra tenue. */
export function WeekdayChips({ schedule, onChange }: WeekdayChipsProps) {
  const active = activeDays(schedule);

  function toggle(day: Weekday) {
    const next = active.includes(day) ? active.filter((d) => d !== day) : [...active, day];
    onChange?.(WEEKDAYS.filter((d) => next.includes(d)));
  }

  return (
    <div className="flex items-center gap-1">
      {WEEKDAYS.map((day) => {
        const on = active.includes(day);
        const className = cn(
          "flex size-6 items-center justify-center rounded-md font-mono text-xs transition-colors duration-(--dur-fast)",
          on ? "bg-primary-soft font-medium text-primary-text" : "text-faint",
          onChange && "hover:bg-muted active:scale-95",
          onChange && on && "hover:bg-primary-soft/70",
        );
        if (!onChange) {
          return (
            <span key={day} className={className} aria-label={on ? WEEKDAY_NAME[day] : undefined}>
              {WEEKDAY_LETTER[day]}
            </span>
          );
        }
        return (
          <button
            key={day}
            type="button"
            aria-pressed={on}
            aria-label={WEEKDAY_NAME[day]}
            className={className}
            onClick={() => toggle(day)}
          >
            {WEEKDAY_LETTER[day]}
          </button>
        );
      })}
    </div>
  );
}

// «N veces por semana» no tiene días fijos: se enseña sin ninguno marcado.
function activeDays(schedule: HabitSchedule): Weekday[] {
  if (schedule === "daily") return [...WEEKDAYS];
  return Array.isArray(schedule) ? schedule : [];
}
