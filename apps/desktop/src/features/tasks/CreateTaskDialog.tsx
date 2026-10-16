import type { Priority, TaskDraft } from "@rumbo/core";
import { PlusIcon, XIcon } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { OptionSelect } from "@/components/OptionSelect";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CounterPicker } from "@/features/counters/CounterPicker";

const DURATIONS = [
  { label: "Sin duración", value: null },
  { label: "15 min", value: "15" },
  { label: "30 min", value: "30" },
  { label: "45 min", value: "45" },
  { label: "1 h", value: "60" },
  { label: "1 h 30", value: "90" },
  { label: "2 h", value: "120" },
];

const REPEATS = [
  { label: "No se repite", value: null },
  { label: "Cada día", value: "every day" },
  { label: "Cada semana", value: "every week" },
  { label: "Cada mes", value: "every month" },
];

const EMPTY: TaskDraft = { text: "", steps: [] };

/** Crear una tarea con todos sus detalles. Se guarda en el inbox en formato Tasks. */
export function CreateTaskDialog() {
  const rumbo = useRumbo();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>(EMPTY);
  const areas = rumbo.store.notesOfType("area").map((note) => String(note.data.name ?? note.name));

  const update = (changes: Partial<TaskDraft>) => setDraft((old) => ({ ...old, ...changes }));
  const steps = draft.steps ?? [];

  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (!draft.text.trim()) return;
    await rumbo.tasks.create(draft);
    toast.success("Tarea creada en el inbox");
    setDraft(EMPTY);
    setOpen(false);
  }

  // Ctrl Enter guarda desde cualquier campo, también desde los pasos.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) void save();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <PlusIcon data-icon="inline-start" />
        Nueva tarea
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" onKeyDown={onKeyDown}>
        <form onSubmit={save} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="task-text">Qué hay que hacer</FieldLabel>
              <Input
                id="task-text"
                autoFocus
                value={draft.text}
                onChange={(event) => update({ text: event.target.value })}
                placeholder="Preparar la demo del lunes"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="task-scheduled">Cuándo la haré</FieldLabel>
                <Input
                  id="task-scheduled"
                  type="date"
                  value={draft.scheduled ?? ""}
                  onChange={(event) => update({ scheduled: event.target.value || undefined })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="task-due">Fecha límite</FieldLabel>
                <Input
                  id="task-due"
                  type="date"
                  value={draft.due ?? ""}
                  onChange={(event) => update({ due: event.target.value || undefined })}
                />
              </Field>
              <Field>
                <FieldLabel>Duración</FieldLabel>
                <OptionSelect
                  options={DURATIONS}
                  value={draft.duration ? String(draft.duration) : null}
                  onChange={(value) => update({ duration: value ? Number(value) : undefined })}
                />
              </Field>
              <Field>
                <FieldLabel>Repetir</FieldLabel>
                <OptionSelect
                  options={REPEATS}
                  value={draft.recurrence ?? null}
                  onChange={(value) => update({ recurrence: value ?? undefined })}
                />
              </Field>
              <Field>
                <FieldLabel>Área</FieldLabel>
                <OptionSelect
                  options={[
                    { label: "Sin área", value: null },
                    ...areas.map((name) => ({ label: name, value: name })),
                  ]}
                  value={draft.area ?? null}
                  onChange={(value) => update({ area: value ?? undefined })}
                />
              </Field>
              <Field>
                <FieldLabel>Prioridad</FieldLabel>
                <ToggleGroup
                  variant="outline"
                  value={draft.priority ? [draft.priority] : []}
                  onValueChange={(values) =>
                    update({ priority: (values[0] as Priority | undefined) ?? undefined })
                  }
                >
                  <ToggleGroupItem value="high">Alta</ToggleGroupItem>
                  <ToggleGroupItem value="medium">Media</ToggleGroupItem>
                  <ToggleGroupItem value="low">Baja</ToggleGroupItem>
                </ToggleGroup>
              </Field>
            </div>

            <Field>
              <FieldLabel>Contador</FieldLabel>
              <CounterPicker value={draft.counter} onChange={(counter) => update({ counter })} />
            </Field>

            <Field>
              <FieldLabel>Pasos</FieldLabel>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={step}
                    aria-label={`Paso ${index + 1}`}
                    onChange={(event) =>
                      update({ steps: steps.map((s, i) => (i === index ? event.target.value : s)) })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar paso"
                    onClick={() => update({ steps: steps.filter((_, i) => i !== index) })}
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                className="w-fit"
                onClick={() => update({ steps: [...steps, ""] })}
              >
                <PlusIcon data-icon="inline-start" />
                Añadir paso
              </Button>
            </Field>
          </FieldGroup>

          <DialogFooter className="items-center">
            <Kbd>Ctrl Enter</Kbd>
            <Button type="submit" disabled={!draft.text.trim()}>
              Crear tarea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
