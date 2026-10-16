import type { Counter } from "@rumbo/core";
import type { ReactElement } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CounterPicker } from "./CounterPicker";

/** El selector de contadores en un popover que cuelga del botón que se le pase. */
export function CounterTypeMenu({
  value,
  trigger,
  onChange,
}: {
  value: Counter | undefined;
  trigger: ReactElement;
  onChange: (counter: Counter | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="end" className="w-[30rem] p-3">
        <CounterPicker value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
