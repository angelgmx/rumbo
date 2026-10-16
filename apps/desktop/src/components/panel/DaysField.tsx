import { WEEKDAYS, type HabitSchedule, type Weekday } from "@rumbo/core";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { cn } from "@/lib/utils";

const LETTERS: Record<Weekday, string> = {
  mon: "L",
  tue: "M",
  wed: "X",
  thu: "J",
  fri: "V",
  sat: "S",
  sun: "D",
};

const TIMES = ["1", "2", "3", "4", "5", "6"];

/**
 * Qué días toca, en la misma fila: las letras se marcan y desmarcan (las siete son «todos los
 * días»); si se deja, al lado se cambia a «N veces por semana», que vale cualquier día.
 */
export function DaysField({
  value,
  perWeek = true,
  onChange,
}: {
  value: HabitSchedule;
  /** Si se puede elegir «N veces por semana» (un hábito sí; una rutina tiene días fijos). */
  perWeek?: boolean;
  onChange: (schedule: HabitSchedule) => void;
}) {
  const weekly = typeof value === "object" && !Array.isArray(value);
  const days: readonly Weekday[] = value === "daily" ? WEEKDAYS : Array.isArray(value) ? value : [];

  function toggle(day: Weekday) {
    const base = weekly ? [] : days;
    const next = WEEKDAYS.filter((d) => (d === day ? !base.includes(d) : base.includes(d)));
    onChange(next.length === WEEKDAYS.length ? "daily" : next);
  }

  return (
    <div className="flex items-center gap-1">
      {WEEKDAYS.map((day) => (
        <button
          key={day}
          type="button"
          aria-pressed={days.includes(day)}
          aria-label={LETTERS[day]}
          onClick={() => toggle(day)}
          className={cn(
            "flex h-6 w-7 items-center justify-center rounded-md text-xs text-faint transition-colors duration-(--dur-fast) outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
            days.includes(day) && "bg-muted text-foreground ring-1 ring-border",
          )}
        >
          {LETTERS[day]}
        </button>
      ))}
      {perWeek && (
        <PropertyPopover
          label="Veces por semana"
          width="w-56"
          className="ml-1 h-6 rounded-md px-2 whitespace-nowrap text-muted-foreground"
          trigger={weekly ? `${value.times_per_week} por semana` : "o por semana"}
        >
          {(close) => (
            <OptionList
              options={TIMES.map((n) => ({ value: n, label: `${n} por semana, cualquier día` }))}
              value={weekly ? String(value.times_per_week) : undefined}
              clearLabel="Los días marcados"
              onChoose={(times) => {
                onChange(times ? { times_per_week: Number(times) } : ["mon", "wed", "fri"]);
                close();
              }}
            />
          )}
        </PropertyPopover>
      )}
    </div>
  );
}
