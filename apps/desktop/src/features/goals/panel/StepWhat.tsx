import type { GoalInput } from "@rumbo/core";
import { DateRow } from "@/components/panel/DateRow";
import { AreaRow, PeriodRow } from "../propertyRows";
import { Input } from "@/components/ui/input";
import { StepSection } from "./StepSection";

/** Paso 1: qué quieres conseguir, en qué área, para cuándo. */
export function StepWhat({
  input,
  onChange,
}: {
  input: GoalInput;
  onChange: (changes: Partial<GoalInput>) => void;
}) {
  return (
    <StepSection step={1} title="¿Qué quieres conseguir?" done={input.title.trim() !== ""}>
      <Input
        autoFocus
        value={input.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder="Hablar inglés con fluidez en una entrevista técnica"
        aria-label="Objetivo"
        className="h-9"
      />
      <div className="-ml-2 flex flex-col">
        <AreaRow area={input.area} onChange={onChange} />
        <PeriodRow period={input.period} onChange={onChange} />
        <DateRow
          label="Fecha límite"
          empty="Sin fecha"
          date={input.deadline}
          onChange={(deadline) => onChange({ deadline })}
        />
      </div>
    </StepSection>
  );
}
