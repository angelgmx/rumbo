import { AI_PROVIDERS, type AiProviderKind } from "@/features/ai/aiSettings";
import { cn } from "@/lib/utils";

interface ProviderPickerProps {
  value: AiProviderKind;
  onChange: (provider: AiProviderKind) => void;
}

/** Una tarjeta por proveedor; la elegida, con el borde del acento. */
export function ProviderPicker({ value, onChange }: ProviderPickerProps) {
  const kinds = Object.keys(AI_PROVIDERS) as AiProviderKind[];

  return (
    <div role="radiogroup" aria-label="Proveedor" className="grid grid-cols-3 gap-3">
      {kinds.map((kind) => (
        <ProviderCard
          key={kind}
          kind={kind}
          selected={kind === value}
          onSelect={() => onChange(kind)}
        />
      ))}
    </div>
  );
}

function ProviderCard({
  kind,
  selected,
  onSelect,
}: {
  kind: AiProviderKind;
  selected: boolean;
  onSelect: () => void;
}) {
  const { label, description } = AI_PROVIDERS[kind];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border bg-card p-4 text-left transition-colors duration-(--dur-fast) hover:bg-muted",
        selected && "border-primary ring-1 ring-primary",
      )}
    >
      <span className="flex items-center gap-2.5 font-medium">
        <span
          aria-hidden
          className={cn(
            "flex size-4 items-center justify-center rounded-full border",
            selected && "border-primary",
          )}
        >
          {selected && <span className="size-2 rounded-full bg-primary" />}
        </span>
        {label}
      </span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </button>
  );
}
