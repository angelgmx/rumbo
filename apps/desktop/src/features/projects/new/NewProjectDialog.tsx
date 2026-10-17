import type { KeyboardEvent } from "react";
import { CalendarIcon, CheckIcon, CircleDotIcon, LayoutGridIcon, TargetIcon } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { DayPicker } from "@/components/panel/DayPicker";
import { OptionList } from "@/components/panel/OptionList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AreaDot } from "@/features/tasks/AreaDot";
import { useAreaNames } from "@/hooks/useAreaNames";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { formatLongDay } from "@/lib/format";
import { projectHref, STATUS_LABEL, STATUS_ORDER } from "../projectLabels";
import { DraftMilestones } from "./DraftMilestones";
import { DraftTasks } from "./DraftTasks";
import { ChoiceField, FormField } from "./FormField";
import { ProjectConnections } from "./ProjectConnections";
import { ProjectPreview } from "./ProjectPreview";
import { useProjectDraft } from "./useProjectDraft";

/** Crear un proyecto desde cero: lo básico, sus hitos y sus primeras tareas, con una vista de cómo quedará. */
export function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] gap-0 p-0 sm:max-w-5xl" showCloseButton={false}>
        {open && <NewProjectForm onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const areas = useAreaNames();
  const goals = useVaultQuery((r) => r.goals.list()).data ?? [];
  const { draft, input, tasks, problem, patch, ...lists } = useProjectDraft();
  const goal = goals.find(({ id }) => id === draft.goalId);

  async function save() {
    if (problem) return;
    const id = await rumbo.projects.create(input, tasks);
    toast.success(`«${input.title}» creado`);
    onClose();
    if (id !== undefined) navigate(projectHref(id));
  }

  // Ctrl Enter guarda desde cualquier campo.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void save();
    }
  }

  return (
    <div className="flex min-h-0 flex-col" onKeyDown={onKeyDown}>
      <DialogHeader className="border-b px-6 py-5">
        <DialogTitle className="text-xl">Nuevo proyecto</DialogTitle>
        <DialogDescription>
          Algo con un final: lo terminas y se archiva. Si no acaba nunca, es un área o un hábito.
        </DialogDescription>
      </DialogHeader>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_21rem] gap-8 overflow-y-auto p-6">
        <div className="flex flex-col gap-5">
          <FormField label="Nombre">
            <Input
              autoFocus
              aria-label="Nombre"
              value={draft.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="Ganar masa muscular"
              className="h-10"
            />
          </FormField>
          <FormField label="Resultado: ¿cómo sabrás que está terminado?" hint="obligatorio">
            <Input
              aria-label="Resultado"
              value={draft.outcome}
              onChange={(event) => patch({ outcome: event.target.value })}
              placeholder="77 kg en báscula con la cintura igual y 4 entrenos por semana"
              className="h-10"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <ChoiceField
              icon={TargetIcon}
              label="Objetivo al que contribuye"
              empty="Sin objetivo"
              value={goal?.goal.title}
              width="w-72"
            >
              {(close) => (
                <OptionList
                  options={goals.map(({ id, goal: item }) => ({
                    value: String(id),
                    label: item.title,
                  }))}
                  value={draft.goalId === undefined ? undefined : String(draft.goalId)}
                  clearLabel="Sin objetivo"
                  onChoose={(id) => {
                    patch({ goalId: id === undefined ? undefined : Number(id) });
                    close();
                  }}
                />
              )}
            </ChoiceField>
            <ChoiceField
              icon={LayoutGridIcon}
              label="Área"
              empty="Sin área"
              value={
                draft.area && (
                  <>
                    <AreaDot area={draft.area} />
                    {draft.area}
                  </>
                )
              }
              width="w-60"
            >
              {(close) => (
                <OptionList
                  options={areas.map((name) => ({ value: name, label: name }))}
                  value={draft.area}
                  clearLabel="Sin área"
                  onChoose={(area) => {
                    patch({ area });
                    close();
                  }}
                />
              )}
            </ChoiceField>
            <ChoiceField
              icon={CalendarIcon}
              label="Fecha límite"
              empty="Sin fecha límite"
              value={draft.deadline && formatLongDay(draft.deadline)}
              width="w-auto p-1"
            >
              {(close) => (
                <DayPicker
                  date={draft.deadline}
                  onChange={(deadline) => patch({ deadline })}
                  onDone={close}
                />
              )}
            </ChoiceField>
            <ChoiceField
              icon={CircleDotIcon}
              label="Estado"
              value={STATUS_LABEL[draft.status]}
              width="w-48"
            >
              {(close) => (
                <OptionList
                  options={STATUS_ORDER.map((status) => ({
                    value: status,
                    label: STATUS_LABEL[status],
                  }))}
                  value={draft.status}
                  onChoose={(status) => {
                    if (status) patch({ status: status as typeof draft.status });
                    close();
                  }}
                />
              )}
            </ChoiceField>
          </div>
          <DraftMilestones
            milestones={draft.milestones}
            onAdd={lists.addMilestone}
            onRemove={lists.removeMilestone}
          />
          <DraftTasks tasks={tasks} onAdd={lists.addTask} onRemove={lists.removeTask} />
        </div>
        <div className="flex flex-col gap-6">
          <ProjectPreview draft={draft} />
          <ProjectConnections draft={draft} goal={goal} />
        </div>
      </div>
      <DialogFooter className="items-center border-t px-6 py-4 sm:justify-between">
        <span className="text-sm text-muted-foreground">{problem}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={problem !== undefined} onClick={() => void save()}>
            <CheckIcon data-icon="inline-start" />
            Crear proyecto
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}
