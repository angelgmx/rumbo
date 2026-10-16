import type { GoalInput, KeyResult } from "@rumbo/core";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepSection } from "./StepSection";

/** Paso 3: cómo sabrás que lo has logrado; cada resultado clave va de un valor a otro. */
export function StepMeasure({
  input,
  onChange,
}: {
  input: GoalInput;
  onChange: (changes: Partial<GoalInput>) => void;
}) {
  const { keyResults } = input;
  const change = (index: number, changes: Partial<KeyResult>) =>
    onChange({
      keyResults: keyResults.map((keyResult, i) =>
        i === index ? { ...keyResult, ...changes } : keyResult,
      ),
    });

  return (
    <StepSection
      step={3}
      title="¿Cómo sabrás que lo has logrado?"
      hint="Sin métrica, el avance sale de lo que lo empuja."
      done={keyResults.some((keyResult) => keyResult.title.trim())}
    >
      {keyResults.map((keyResult, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={keyResult.title}
              onChange={(event) => change(index, { title: event.target.value })}
              placeholder="Sesiones de conversación"
              aria-label="Métrica"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Quitar la métrica"
              onClick={() => onChange({ keyResults: keyResults.filter((_, i) => i !== index) })}
            >
              <XIcon />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Desde
            <NumberField
              label="Desde"
              value={keyResult.from}
              onChange={(from) => change(index, { from })}
            />
            hasta
            <NumberField
              label="Hasta"
              value={keyResult.target}
              onChange={(target) => change(index, { target })}
            />
            <Input
              value={keyResult.unit ?? ""}
              onChange={(event) => change(index, { unit: event.target.value || undefined })}
              placeholder="sesiones"
              aria-label="Unidad"
              className="flex-1"
            />
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange({ keyResults: [...keyResults, { title: "", from: 0, target: 0 }] })}
      >
        <PlusIcon data-icon="inline-start" />
        Añadir métrica
      </Button>
    </StepSection>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label={label}
      className="w-20 font-mono"
    />
  );
}
