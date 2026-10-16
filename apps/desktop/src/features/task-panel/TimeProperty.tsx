import { PropertyRow } from "@/components/panel/PropertyRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** La hora a la que toca la tarea el día que empieza. */
export function TimeProperty({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (time: string | undefined) => void;
}) {
  return (
    <PropertyRow
      label="Hora"
      value={value && <span className="font-mono">{value}</span>}
      empty="Añadir hora"
      width="w-56"
    >
      {(close) => (
        <div className="flex items-center gap-2">
          <Input
            type="time"
            aria-label="Hora"
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(undefined);
              close();
            }}
          >
            Quitar
          </Button>
        </div>
      )}
    </PropertyRow>
  );
}
