import { Input } from "@/components/ui/input";

/** Una hora «HH:MM» en un campo pequeño. */
export function TimeField({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (time: string) => void;
}) {
  return (
    <Input
      type="time"
      step={300}
      value={value}
      aria-label={label}
      onChange={(event) => event.target.value && onChange(event.target.value)}
      className="h-7 w-[72px] px-2 font-mono text-[13px] [&::-webkit-calendar-picker-indicator]:hidden"
    />
  );
}
