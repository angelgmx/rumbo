import type { GoalInput, IfThen } from "@rumbo/core";
import { ArrowRightIcon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepSection } from "./StepSection";

/** Paso 4: qué te va a frenar y qué harás cuando pase (si… entonces…). */
export function StepObstacle({
  input,
  onChange,
}: {
  input: GoalInput;
  onChange: (changes: Partial<GoalInput>) => void;
}) {
  const { plans } = input;
  const change = (index: number, changes: Partial<IfThen>) =>
    onChange({ plans: plans.map((plan, i) => (i === index ? { ...plan, ...changes } : plan)) });

  return (
    <StepSection step={4} title="¿Qué te va a frenar?" done={input.obstacle.trim() !== ""}>
      <Input
        value={input.obstacle}
        onChange={(event) => onChange({ obstacle: event.target.value })}
        placeholder="Me da vergüenza hablar y lo voy dejando"
        aria-label="Obstáculo"
        className="h-9"
      />
      {plans.map((plan, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
          Si
          <Input
            value={plan.if}
            onChange={(event) => change(index, { if: event.target.value })}
            placeholder="lo dejo"
            aria-label="Si"
            className="flex-1"
          />
          <ArrowRightIcon className="size-3.5 shrink-0" />
          <Input
            value={plan.then}
            onChange={(event) => change(index, { then: event.target.value })}
            placeholder="reservo 3 clases el domingo"
            aria-label="Entonces"
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Quitar el plan"
            onClick={() => onChange({ plans: plans.filter((_, i) => i !== index) })}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange({ plans: [...plans, { if: "", then: "" }] })}
      >
        <PlusIcon data-icon="inline-start" />
        Añadir plan si… entonces
      </Button>
    </StepSection>
  );
}
