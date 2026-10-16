import { addDays, isInView, type Task, type TaskChanges } from "@rumbo/core";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  InboxIcon,
  LightbulbIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { OptionSelect } from "@/components/OptionSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

type Kind = "task" | "someday" | "idea" | "delete";

const KINDS: { kind: Kind; label: string; icon: LucideIcon }[] = [
  { kind: "task", label: "Tarea", icon: CheckIcon },
  { kind: "someday", label: "Algún día", icon: ClockIcon },
  { kind: "idea", label: "Es una idea", icon: LightbulbIcon },
  { kind: "delete", label: "Borrar", icon: Trash2Icon },
];

const DURATIONS = [
  { label: "Sin duración", value: null },
  { label: "5 min", value: "5" },
  { label: "15 min", value: "15" },
  { label: "30 min", value: "30" },
  { label: "1 h", value: "60" },
  { label: "2 h", value: "120" },
];

/**
 * Vaciar el inbox de una en una: qué es, de qué área, cuándo y cuánto lleva.
 * Guardar pasa a la siguiente; saltar la deja en el inbox para otro momento.
 */
export function ProcessInboxDialog() {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const [open, setOpen] = useState(false);
  // Las saltadas se quedan en el inbox; las recordamos para no volver a enseñarlas ahora.
  const [skipped, setSkipped] = useState<number[]>([]);
  const [total, setTotal] = useState(0);

  const inbox =
    useVaultQuery((r) => r.tasks.all()).data?.filter((task) => isInView(task, "inbox", today)) ??
    [];
  const pending = inbox.filter((task) => !skipped.includes(task.id));
  const current = pending[0];
  const position = total - pending.length + 1;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;
    setSkipped([]);
    setTotal(inbox.length);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />} disabled={inbox.length === 0}>
        <ArrowRightIcon data-icon="inline-start" />
        Procesar Inbox
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <header className="flex flex-col gap-4 px-7 pt-7">
          <div className="flex items-baseline justify-between">
            <DialogTitle>Procesar Inbox</DialogTitle>
            {current && (
              <span className="font-mono text-sm text-muted-foreground">
                {position} de {total}
              </span>
            )}
          </div>
          <Progress value={total ? ((position - 1) / total) * 100 : 100} />
        </header>
        {current ? (
          <TaskDecision
            key={current.id}
            task={current}
            today={today}
            onSkip={() => setSkipped((list) => [...list, current.id])}
          />
        ) : (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckIcon />
              </EmptyMedia>
              <EmptyTitle>Inbox a cero</EmptyTitle>
              <EmptyDescription>Todo tiene su sitio. Buen trabajo.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskDecision({ task, today, onSkip }: { task: Task; today: string; onSkip: () => void }) {
  const rumbo = useRumbo();
  const areas = rumbo.store.notesOfType("area").map((note) => String(note.data.name ?? note.name));
  const [kind, setKind] = useState<Kind>("task");
  const [changes, setChanges] = useState<TaskChanges>({});

  const update = (next: TaskChanges) => setChanges((old) => ({ ...old, ...next }));
  // Para salir del inbox necesita fecha o área; si no, volvería a salir aquí.
  const canSave =
    kind === "delete" ||
    kind === "idea" ||
    (kind === "someday" ? !!changes.area : !!(changes.scheduled || changes.area));

  async function save() {
    if (kind === "delete") return rumbo.tasks.remove(task);
    if (kind === "idea") return rumbo.ideas.fromTask(task);
    // Algún día es solo el área, aunque antes se eligiera fecha como tarea.
    await rumbo.tasks.update(task, kind === "someday" ? { area: changes.area } : changes);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 px-7 py-6">
        <div className="rounded-xl border bg-muted/30 p-5">
          <p className="text-lg font-medium">{task.text}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <InboxIcon className="size-3.5" />
            Capturada el {formatDayMonth(task.created)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">¿Qué es?</span>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="¿Qué es?">
            {KINDS.map(({ kind: option, label, icon: Icon }) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={kind === option}
                onClick={() => setKind(option)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border py-3 text-sm transition-colors duration-(--dur-fast) hover:bg-muted",
                  kind === option && "border-primary bg-primary-soft hover:bg-primary-soft",
                )}
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {kind !== "delete" && kind !== "idea" && (
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Área</FieldLabel>
              <OptionSelect
                options={[
                  { label: "Sin área", value: null },
                  ...areas.map((name) => ({ label: name, value: name })),
                ]}
                value={changes.area ?? null}
                onChange={(area) => update({ area: area ?? undefined })}
              />
            </Field>
            {kind === "task" && (
              <>
                <WhenField today={today} value={changes.scheduled} onChange={update} />
                <Field>
                  <FieldLabel>Duración</FieldLabel>
                  <OptionSelect
                    options={DURATIONS}
                    value={changes.duration ? String(changes.duration) : null}
                    onChange={(value) => update({ duration: value ? Number(value) : undefined })}
                  />
                </Field>
              </>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Regla de los 2 minutos: si se hace en menos de 2 minutos, hazlo ahora y{" "}
          <button
            type="button"
            className="text-foreground underline underline-offset-4"
            onClick={() => rumbo.tasks.setDone(task, true)}
          >
            márcalo hecho
          </button>
          .
        </p>
      </div>

      <footer className="flex items-center gap-4 border-t px-7 py-4">
        <Button variant="ghost" onClick={onSkip}>
          Saltar
        </Button>
        <Button className="ml-auto" onClick={() => void save()} disabled={!canSave}>
          <ArrowRightIcon data-icon="inline-start" />
          Guardar y siguiente
        </Button>
      </footer>
    </div>
  );
}

function WhenField({
  today,
  value,
  onChange,
}: {
  today: string;
  value: string | undefined;
  onChange: (changes: TaskChanges) => void;
}) {
  const tomorrow = addDays(today, 1);
  const preset =
    value === undefined ? null : value === today || value === tomorrow ? value : "other";

  return (
    <Field>
      <FieldLabel>Cuándo</FieldLabel>
      <div className="flex gap-2">
        <OptionSelect
          options={[
            { label: "Sin fecha", value: null },
            { label: "Hoy", value: today },
            { label: "Mañana", value: tomorrow },
            { label: "Otro día", value: "other" },
          ]}
          value={preset}
          onChange={(next) =>
            onChange({ scheduled: next === "other" ? addDays(today, 2) : (next ?? undefined) })
          }
        />
        {preset === "other" && (
          <Input
            type="date"
            aria-label="Fecha"
            value={value}
            onChange={(event) => onChange({ scheduled: event.target.value || undefined })}
          />
        )}
      </div>
    </Field>
  );
}
