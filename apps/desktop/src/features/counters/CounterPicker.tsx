import { COUNTER_KINDS, type Counter, type CounterKind } from "@rumbo/core";
import { CheckIcon, MinusIcon, PlusIcon, type LucideIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CounterChip } from "./CounterChip";
import { COUNTER_INFO, NO_COUNTER } from "./counterKinds";

/** Elegir cómo se mide una tarea y hasta dónde. Sin contador, la tarea es una casilla. */
export function CounterPicker({
  value,
  onChange,
}: {
  value: Counter | undefined;
  onChange: (counter: Counter | undefined) => void;
}) {
  const { work, rest } = useRumbo().store.config.pomodoro;

  // Cambiar de tipo empieza de cero: 12 minutos no son 12 vasos.
  const choose = (kind: CounterKind) =>
    onChange({ kind, current: 0, target: COUNTER_INFO[kind].defaultTarget });
  const setTarget = (target: number) =>
    value && onChange({ ...value, target: Math.max(1, target) });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Contador">
        <KindTile {...NO_COUNTER} selected={!value} onSelect={() => onChange(undefined)} />
        {COUNTER_KINDS.map((kind) => (
          <KindTile
            key={kind}
            {...COUNTER_INFO[kind]}
            hint={kind === "pomodoro" ? `${work} / ${rest}` : COUNTER_INFO[kind].hint}
            selected={value?.kind === kind}
            onSelect={() => choose(kind)}
          />
        ))}
      </div>

      {value && (
        <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {COUNTER_INFO[value.kind].targetLabel}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setTarget(value.target - 1)}
            aria-label="Menos"
          >
            <MinusIcon />
          </Button>
          <span className="w-8 text-center font-mono tabular-nums">{value.target}</span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setTarget(value.target + 1)}
            aria-label="Más"
          >
            <PlusIcon />
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">Así se verá</span>
          <CounterChip counter={value} />
        </div>
      )}
    </div>
  );
}

function KindTile({
  label,
  hint,
  icon: Icon,
  selected,
  onSelect,
}: {
  label: string;
  hint: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-sm transition-colors duration-(--dur-fast) hover:bg-muted",
        selected && "border-primary bg-primary-soft hover:bg-primary-soft",
      )}
    >
      {selected && (
        <CheckIcon className="absolute top-1.5 right-1.5 size-3.5 rounded-full bg-primary p-0.5 text-primary-foreground" />
      )}
      <Icon className="size-4 text-muted-foreground" />
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}
