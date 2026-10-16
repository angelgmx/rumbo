import type { TaskStep } from "@rumbo/core";
import { PlusIcon, XIcon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { StepsBar } from "@/features/tasks/StepsBar";
import { PanelSection } from "@/components/panel/PanelSection";

/** Los pasos de la tarea: una lista de casillas que se marcan, se escriben y se quitan. */
export function TaskSteps({
  steps,
  onChange,
}: {
  steps: TaskStep[];
  onChange: (steps: TaskStep[]) => void;
}) {
  const edit = (index: number, changes: Partial<TaskStep>) =>
    onChange(steps.map((step, i) => (i === index ? { ...step, ...changes } : step)));
  const doneCount = steps.filter((step) => step.done).length;
  const add = () => onChange([...steps, { text: "", done: false }]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    add();
  }

  return (
    <PanelSection
      title={`Pasos${steps.length > 0 ? ` · ${doneCount} de ${steps.length}` : ""}`}
      action={
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={add}
        >
          <PlusIcon data-icon="inline-start" />
          Añadir
        </Button>
      }
    >
      {steps.length === 0 && <p className="text-sm text-muted-foreground/60">Sin pasos todavía</p>}
      {steps.length > 0 && <StepsBar done={doneCount} total={steps.length} />}
      <div className="flex flex-col gap-1">
        {steps.map((step, index) => (
          <div key={index} className="group flex items-center gap-3 py-0.5">
            <Checkbox
              checked={step.done}
              onCheckedChange={(checked) => edit(index, { done: checked === true })}
              aria-label={`Paso ${index + 1} hecho`}
            />
            <input
              autoFocus={step.text === ""}
              value={step.text}
              onChange={(event) => edit(index, { text: event.target.value })}
              onKeyDown={onKeyDown}
              aria-label={`Paso ${index + 1}`}
              className={cn(
                "min-w-0 flex-1 bg-transparent outline-none",
                step.done && "text-muted-foreground line-through",
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
              aria-label="Quitar paso"
              onClick={() => onChange(steps.filter((_, i) => i !== index))}
            >
              <XIcon />
            </Button>
          </div>
        ))}
      </div>
    </PanelSection>
  );
}
