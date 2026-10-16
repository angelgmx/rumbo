import { HOUR_LABELS, joinTime, MINUTE_LABELS, splitTime } from "./time";
import { TimeWheel } from "./TimeWheel";

/** Horas y minutos (de 5 en 5) en dos ruedas; el valor es "HH:MM". */
export function TimeWheels({
  value,
  onChange,
}: {
  value: string;
  onChange: (time: string) => void;
}) {
  const { hour, minuteStep } = splitTime(value);

  return (
    <div role="group" aria-label="Hora" className="flex items-center justify-center">
      <TimeWheel
        label="Horas"
        labels={HOUR_LABELS}
        index={hour}
        onChange={(next) => onChange(joinTime(next, minuteStep))}
      />
      <span aria-hidden className="text-sm font-medium text-muted-foreground">
        :
      </span>
      <TimeWheel
        label="Minutos"
        labels={MINUTE_LABELS}
        index={minuteStep}
        onChange={(next) => onChange(joinTime(hour, next))}
      />
    </div>
  );
}
