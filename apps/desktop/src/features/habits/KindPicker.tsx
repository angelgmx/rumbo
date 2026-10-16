import { FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { HABIT_KINDS, type HabitKind } from "./habitKinds";

/** Tarjetas para elegir cómo se cumple el hábito. La elegida se marca con el acento. */
export function KindPicker({
  value,
  onChange,
}: {
  value: HabitKind;
  onChange: (kind: HabitKind) => void;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as HabitKind)}
      className="grid grid-cols-2 gap-3"
    >
      {HABIT_KINDS.map((kind) => {
        const selected = kind.value === value;
        return (
          <FieldLabel
            key={kind.value}
            htmlFor={`habit-kind-${kind.value}`}
            className="flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors duration-(--dur-fast) hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary-soft"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-(--dur-fast)",
                selected && "bg-primary text-primary-foreground",
              )}
            >
              <kind.icon className="size-[18px]" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium">{kind.title}</span>
              <span className="text-xs text-muted-foreground">{kind.description}</span>
              <span className="mt-1 font-mono text-[11px] text-faint">{kind.example}</span>
            </span>
            <RadioGroupItem value={kind.value} id={`habit-kind-${kind.value}`} className="mt-0.5" />
          </FieldLabel>
        );
      })}
    </RadioGroup>
  );
}
