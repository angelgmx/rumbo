import { addDays, type IsoDate } from "@rumbo/core";
import { CalendarIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeDay, formatShortDay } from "@/lib/format";
import { PropertyChip } from "./PropertyChip";

/** Cuándo se hace la tarea y, si lo tiene, hasta cuándo vale. */
export function WhenChip({
  scheduled,
  due,
  onChange,
}: {
  scheduled: IsoDate | undefined;
  due: IsoDate | undefined;
  onChange: (changes: { scheduled?: IsoDate; due?: IsoDate }) => void;
}) {
  const today = useRumbo().daily.today();

  return (
    <PropertyChip
      icon={<CalendarIcon />}
      label={whenLabel(scheduled, due, today)}
      filled={scheduled !== undefined || due !== undefined}
      accent
      width="w-64 gap-3 p-3"
    >
      {(close) => (
        <>
          <div className="flex gap-1.5">
            <QuickDay
              label="Hoy"
              onPick={() => {
                onChange({ scheduled: today });
                close();
              }}
            />
            <QuickDay
              label="Mañana"
              onPick={() => {
                onChange({ scheduled: addDays(today, 1) });
                close();
              }}
            />
            <QuickDay
              label="Sin fecha"
              onPick={() => {
                onChange({ scheduled: undefined });
                close();
              }}
            />
          </div>
          <DateField
            label="Hacer el"
            value={scheduled}
            onChange={(date) => onChange({ scheduled: date })}
          />
          <DateField label="Vence" value={due} onChange={(date) => onChange({ due: date })} />
        </>
      )}
    </PropertyChip>
  );
}

function whenLabel(
  scheduled: IsoDate | undefined,
  due: IsoDate | undefined,
  today: IsoDate,
): string {
  if (scheduled && due) return `${formatRelativeDay(scheduled, today)} → ${formatShortDay(due)}`;
  if (scheduled) return formatRelativeDay(scheduled, today);
  if (due) return `Vence ${formatShortDay(due)}`;
  return "Cuándo";
}

function QuickDay({ label, onPick }: { label: string; onPick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onPick}>
      {label}
    </Button>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: IsoDate | undefined;
  onChange: (date: IsoDate | undefined) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input
        type="date"
        className="w-40"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    </label>
  );
}
