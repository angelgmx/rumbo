import { ORGANIZE_MODES, type OrganizeMode } from "@/features/ai/aiSettings";
import { cn } from "@/lib/utils";

interface OrganizeModePickerProps {
  value: OrganizeMode;
  onChange: (mode: OrganizeMode) => void;
}

/** Tres tarjetas: qué hace la IA con las tareas sueltas; la elegida, con el borde del acento. */
export function OrganizeModePicker({ value, onChange }: OrganizeModePickerProps) {
  const modes = Object.keys(ORGANIZE_MODES) as OrganizeMode[];

  return (
    <div role="radiogroup" aria-label="Organizar tareas nuevas" className="grid grid-cols-3 gap-3">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={mode === value}
          onClick={() => onChange(mode)}
          className={cn(
            "flex flex-col gap-1.5 rounded-xl border bg-card p-4 text-left transition-colors duration-(--dur-fast) hover:bg-muted",
            mode === value && "border-primary ring-1 ring-primary",
          )}
        >
          <span className="font-medium">{ORGANIZE_MODES[mode].label}</span>
          <span className="text-sm text-muted-foreground">{ORGANIZE_MODES[mode].description}</span>
        </button>
      ))}
    </div>
  );
}
