import { Button } from "@/components/ui/button";
import { DEFAULT_TIME } from "./time";
import { TimeWheels } from "./TimeWheels";

/** La hora es opcional: sin ella solo se ve el botón para añadirla. */
export function OptionalTime({
  time,
  onChange,
}: {
  time: string | undefined;
  onChange: (time: string | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1 border-t pt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Hora</span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => onChange(time ? undefined : DEFAULT_TIME)}
        >
          {time ? "Quitar hora" : "Añadir hora"}
        </Button>
      </div>
      {time && <TimeWheels value={time} onChange={onChange} />}
    </div>
  );
}
