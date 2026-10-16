import type { GoalInput } from "@rumbo/core";
import { Textarea } from "@/components/ui/textarea";
import { StepSection } from "./StepSection";

/** Paso 2: por qué te importa. */
export function StepWhy({
  input,
  onChange,
}: {
  input: GoalInput;
  onChange: (changes: Partial<GoalInput>) => void;
}) {
  return (
    <StepSection step={2} title="¿Por qué te importa?" done={input.why.trim() !== ""}>
      <Textarea
        value={input.why}
        onChange={(event) => onChange({ why: event.target.value })}
        placeholder="Para poder trabajar en empresas de fuera y no bloquearme cuando me hablan rápido."
        aria-label="Por qué te importa"
        className="min-h-20"
      />
    </StepSection>
  );
}
