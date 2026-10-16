import { addDays, type IsoDate } from "@rumbo/core";
import type { ReactNode } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeDay } from "@/lib/format";
import { PropertyRow } from "./PropertyRow";

/** Una fecha de la tarea (cuándo se hace, hasta cuándo vale): días rápidos y un campo de fecha. */
export function DateProperty({
  icon,
  label,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: IsoDate | undefined;
  onChange: (date: IsoDate | undefined) => void;
}) {
  const today = useRumbo().daily.today();

  return (
    <PropertyRow
      icon={icon}
      label={label}
      value={value && formatRelativeDay(value, today)}
      width="w-64 gap-3 p-3"
    >
      {(close) => (
        <>
          <div className="flex gap-1.5">
            {[
              { name: "Hoy", date: today },
              { name: "Mañana", date: addDays(today, 1) },
            ].map(({ name, date }) => (
              <Button
                key={name}
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onChange(date);
                  close();
                }}
              >
                {name}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                onChange(undefined);
                close();
              }}
            >
              Quitar
            </Button>
          </div>
          <Input
            type="date"
            aria-label={label}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          />
        </>
      )}
    </PropertyRow>
  );
}
