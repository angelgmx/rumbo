import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STEPS = [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120];

/** Duración de un bloque en pasos redondos; si la nota tiene otra, también sale en la lista. */
export function MinutesSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (minutes: number) => void;
}) {
  const options = [...new Set([...STEPS, value])]
    .sort((a, b) => a - b)
    .map((minutes) => ({ value: minutes, label: `${minutes} min` }));

  return (
    <Select items={options} value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger size="sm" className="w-24 font-mono" aria-label="Duración del bloque">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
