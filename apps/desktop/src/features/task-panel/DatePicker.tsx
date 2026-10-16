import { addDays, type IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Elegir una fecha: días rápidos, quitarla o escribirla en un campo de fecha. */
export function DatePicker({
  label,
  value,
  onChange,
  onDone,
}: {
  label: string;
  value: IsoDate | undefined;
  onChange: (date: IsoDate | undefined) => void;
  onDone: () => void;
}) {
  const today = useRumbo().daily.today();
  const quick: [string, IsoDate | undefined][] = [
    ["Hoy", today],
    ["Mañana", addDays(today, 1)],
    ["Quitar", undefined],
  ];

  return (
    <div className="flex flex-col gap-3 p-1.5">
      <div className="flex gap-1.5">
        {quick.map(([name, date]) => (
          <Button
            key={name}
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              onChange(date);
              onDone();
            }}
          >
            {name}
          </Button>
        ))}
      </div>
      <Input
        type="date"
        aria-label={label}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    </div>
  );
}
