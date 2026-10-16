import type { KeyboardEvent } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { PanelFooter } from "@/components/panel/PanelFooter";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { SidePanel } from "@/components/panel/SidePanel";
import { goalHref } from "../goalLabels";
import { StepDrivers } from "./StepDrivers";
import { StepMeasure } from "./StepMeasure";
import { StepObstacle } from "./StepObstacle";
import { StepWhat } from "./StepWhat";
import { StepWhy } from "./StepWhy";
import { cleaned, useGoalDraft } from "./useGoalDraft";

/** Crear un objetivo en cinco pasos, en el panel lateral como las tareas. Para editarlo se abre su página. */
export function GoalPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SidePanel open={open} title="Nuevo objetivo" onClose={onClose}>
      {open && <GoalPanelContent onClose={onClose} />}
    </SidePanel>
  );
}

function GoalPanelContent({ onClose }: { onClose: () => void }) {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const { input, drivers, patch, patchDrivers, problem } = useGoalDraft();

  async function save() {
    if (problem) return;
    const id = await rumbo.goals.create(cleaned(input), drivers);
    toast.success(`«${input.title.trim()}» creado`);
    onClose();
    if (id !== undefined) navigate(goalHref(id));
  }

  // Ctrl Enter guarda desde cualquier campo.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void save();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      <PanelHeader crumbs={["Objetivos", "Nuevo objetivo"]} onClose={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 pb-6">
        <p className="text-sm text-muted-foreground">
          Un objetivo es un resultado que quieres en una fecha. Lo empujan proyectos, hábitos y
          rutas.
        </p>
        <StepWhat input={input} onChange={patch} />
        <StepWhy input={input} onChange={patch} />
        <StepMeasure input={input} onChange={patch} />
        <StepObstacle input={input} onChange={patch} />
        <StepDrivers drivers={drivers} onChange={patchDrivers} />
      </div>
      <PanelFooter
        label="Crear objetivo"
        disabled={problem !== undefined}
        onSubmit={() => void save()}
      >
        {problem && <span className="text-sm text-muted-foreground">{problem}</span>}
      </PanelFooter>
    </div>
  );
}
