import { minutesBetween } from "@rumbo/core";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatMinutes } from "@/lib/format";

interface TimeRange {
  start: string;
  end: string;
}

/** "De 07:00 a 08:30" con la duración calculada al lado. */
export function TimeRangePicker({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  const minutes = value.start && value.end ? minutesBetween(value.start, value.end) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <ClockIcon className="size-4 text-muted-foreground" />
        <Input
          type="time"
          className="w-28"
          aria-label="Empieza"
          value={value.start}
          onChange={(event) => onChange({ ...value, start: event.target.value })}
        />
      </div>
      <ArrowRightIcon className="size-4 text-faint" />
      <Input
        type="time"
        className="w-28"
        aria-label="Termina"
        value={value.end}
        onChange={(event) => onChange({ ...value, end: event.target.value })}
      />
      {minutes > 0 ? (
        <Badge variant="secondary" className="font-mono">
          {formatMinutes(minutes)}
        </Badge>
      ) : (
        value.start &&
        value.end && (
          <span className="text-sm text-destructive">La hora de fin va después del inicio</span>
        )
      )}
    </div>
  );
}
