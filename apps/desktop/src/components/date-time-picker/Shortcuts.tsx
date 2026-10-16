import { Button } from "@/components/ui/button";
import { isActive, type Shortcut } from "./shortcuts";
import type { DateRange } from "./types";

export function Shortcuts({
  shortcuts,
  value,
  onChoose,
}: {
  shortcuts: Shortcut[];
  value: DateRange;
  onChoose: (shortcut: Shortcut) => void;
}) {
  return (
    // Fichas a la medida de su texto: «En 1 semana» no cabe en una rejilla fija de cuatro.
    <div role="group" aria-label="Atajos" className="flex flex-wrap gap-1.5">
      {shortcuts.map((shortcut) => (
        <Button
          key={shortcut.label}
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={isActive(shortcut, value)}
          className="h-7 rounded-full px-3 text-xs font-medium aria-pressed:border-primary/40 aria-pressed:bg-primary-soft aria-pressed:text-primary-text"
          onClick={() => onChoose(shortcut)}
        >
          {shortcut.label}
        </Button>
      ))}
    </div>
  );
}
