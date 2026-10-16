import type { Counter } from "@rumbo/core";
import { TimerIcon } from "lucide-react";
import { CounterChip } from "@/features/counters/CounterChip";
import { CounterPicker } from "@/features/counters/CounterPicker";
import { PropertyRow } from "./PropertyRow";

/** Cómo se mide la tarea: el selector de contadores de `features/counters` en un popover. */
export function CounterProperty({
  value,
  onChange,
}: {
  value: Counter | undefined;
  onChange: (counter: Counter | undefined) => void;
}) {
  return (
    <PropertyRow
      icon={<TimerIcon />}
      label="Contador"
      value={value && <CounterChip counter={value} />}
      width="w-[30rem] p-3"
    >
      {() => <CounterPicker value={value} onChange={onChange} />}
    </PropertyRow>
  );
}
