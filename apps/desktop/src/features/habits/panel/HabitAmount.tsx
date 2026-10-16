import type { HabitInput } from "@rumbo/core";
import { Input } from "@/components/ui/input";

/** La meta de cada día en los de cantidad o tiempo; en los de tareas, cómo se cumplen. */
export function HabitAmount({
  draft,
  onChange,
}: {
  draft: HabitInput;
  onChange: (changes: Partial<HabitInput>) => void;
}) {
  if (draft.kind === "tasks") {
    return (
      <p className="text-sm text-muted-foreground">
        Se cumple al terminar las tareas del día que lleven este hábito.
      </p>
    );
  }
  if (draft.kind === "check") return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      Cada día
      <Input
        type="number"
        min={1}
        className="h-8 w-20 font-mono"
        aria-label="Meta de cada día"
        value={draft.target ?? ""}
        onChange={(event) => onChange({ target: Number(event.target.value) || undefined })}
      />
      {draft.kind === "duration" ? (
        "min"
      ) : (
        <Input
          className="h-8 w-40"
          aria-label="Unidad"
          value={draft.unit ?? ""}
          onChange={(event) => onChange({ unit: event.target.value })}
          placeholder="páginas, series…"
        />
      )}
    </div>
  );
}
