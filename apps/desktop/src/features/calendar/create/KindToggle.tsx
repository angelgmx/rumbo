import { CheckIcon, FlameIcon, RepeatIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CreateKind = "task" | "habit" | "routine";

const KINDS: { value: CreateKind; label: string; icon: LucideIcon }[] = [
  { value: "task", label: "Tarea", icon: CheckIcon },
  { value: "habit", label: "Hábito", icon: FlameIcon },
  { value: "routine", label: "Rutina", icon: RepeatIcon },
];

/** Qué se crea en el hueco: tarea, hábito o rutina. */
export function KindToggle({
  value,
  onChange,
}: {
  value: CreateKind;
  onChange: (kind: CreateKind) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Qué crear"
      className="flex rounded-lg border bg-muted/50 p-0.5"
    >
      {KINDS.map(({ value: kind, label, icon: Icon }) => (
        <button
          key={kind}
          type="button"
          role="radio"
          aria-checked={value === kind}
          onClick={() => onChange(kind)}
          className={cn(
            "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[13px] text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground",
            value === kind && "bg-card text-foreground shadow-card",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
