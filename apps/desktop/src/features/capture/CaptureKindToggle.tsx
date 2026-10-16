import { cn } from "@/lib/utils";

export type CaptureKind = "task" | "idea";

const KINDS: { kind: CaptureKind; label: string }[] = [
  { kind: "task", label: "Tarea" },
  { kind: "idea", label: "Idea" },
];

export function CaptureKindToggle({
  value,
  onChange,
}: {
  value: CaptureKind;
  onChange: (kind: CaptureKind) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Qué captura" className="flex rounded-md border p-0.5">
      {KINDS.map(({ kind, label }) => (
        <button
          key={kind}
          type="button"
          role="radio"
          aria-checked={value === kind}
          onClick={() => onChange(kind)}
          className={cn(
            "rounded px-2.5 py-0.5 text-xs text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground",
            value === kind && "bg-primary-soft text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
