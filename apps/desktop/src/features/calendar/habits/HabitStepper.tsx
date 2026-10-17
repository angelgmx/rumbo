import { MinusIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** − valor + para un hábito de cantidad o tiempo. */
export function HabitStepper({
  label,
  amount,
  target,
  unit,
  onStep,
}: {
  label: string;
  amount: number;
  target: number;
  unit: string;
  onStep: (direction: 1 | -1) => void;
}) {
  return (
    <div className="flex items-center gap-1.5" onPointerDown={(event) => event.stopPropagation()}>
      <StepButton label={`Quitar de ${label}`} onClick={() => onStep(-1)}>
        <MinusIcon />
      </StepButton>
      <span className="min-w-14 text-center font-mono text-[13px] whitespace-nowrap">
        {amount}/{target}
        {unit && ` ${unit}`}
      </span>
      <StepButton label={`Añadir a ${label}`} onClick={() => onStep(1)}>
        <PlusIcon />
      </StepButton>
    </div>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button variant="outline" size="icon-xs" aria-label={label} onClick={onClick}>
      {children}
    </Button>
  );
}
