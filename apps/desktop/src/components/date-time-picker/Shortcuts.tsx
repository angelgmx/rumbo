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
    <div role="group" aria-label="Atajos" className="grid grid-cols-4 gap-1.5">
      {shortcuts.map((shortcut) => (
        <Button
          key={shortcut.label}
          type="button"
          variant="outline"
          size="xs"
          aria-pressed={isActive(shortcut, value)}
          className="px-1 aria-pressed:border-primary/40 aria-pressed:bg-primary-soft aria-pressed:text-primary-text"
          onClick={() => onChoose(shortcut)}
        >
          {shortcut.label}
        </Button>
      ))}
    </div>
  );
}
