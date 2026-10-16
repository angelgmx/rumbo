import { addDays, isInView, type Task } from "@rumbo/core";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  SunIcon,
  SunriseIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

/**
 * Vaciar el inbox de una en una: para cada tarea decides cuándo va, de qué área es,
 * o si ya está hecha o sobra. Así no se acumula.
 */
export function ProcessInboxDialog() {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const inboxPath = rumbo.store.config.folders.inbox;
  const [open, setOpen] = useState(false);
  // Las saltadas se quedan en el inbox; las recordamos para no volver a enseñarlas ahora.
  const [skipped, setSkipped] = useState<string[]>([]);

  const inbox =
    useVaultQuery((r) => r.tasks.all()).data?.filter((task) =>
      isInView(task, "inbox", today, inboxPath),
    ) ?? [];
  const pending = inbox.filter((task) => !skipped.includes(task.text));
  const current = pending[0];

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setSkipped([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />} disabled={inbox.length === 0}>
        Procesar inbox
        <ArrowRightIcon data-icon="inline-end" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Procesar inbox</DialogTitle>
          <DialogDescription>
            {current
              ? `Quedan ${pending.length}. Decide qué hacer con cada una.`
              : "Has terminado."}
          </DialogDescription>
        </DialogHeader>
        {inbox.length > 0 && (
          <Progress value={((inbox.length - pending.length) / inbox.length) * 100} />
        )}
        {current ? (
          <TaskDecision
            key={`${current.path}:${current.line}`}
            task={current}
            today={today}
            onSkip={() => setSkipped((list) => [...list, current.text])}
          />
        ) : (
          <Empty>
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

  const schedule = (date: string) => rumbo.tasks.update(task, { scheduled: date });

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg border bg-muted/50 p-4 text-lg">{task.text}</p>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">¿Cuándo?</span>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => schedule(today)}>
            <SunIcon data-icon="inline-start" />
            Hoy
          </Button>
          <Button variant="outline" onClick={() => schedule(addDays(today, 1))}>
            <SunriseIcon data-icon="inline-start" />
            Mañana
          </Button>
          <Field className="w-auto flex-row items-center gap-2">
            <FieldLabel htmlFor="process-date" className="sr-only">
              Otra fecha
            </FieldLabel>
            <CalendarIcon className="size-4 text-muted-foreground" />
            <Input
              id="process-date"
              type="date"
              className="w-40"
              onChange={(event) => event.target.value && void schedule(event.target.value)}
            />
          </Field>
        </div>
      </div>

      {areas.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            O dale un área (sale de Inbox y va a Algún día)
          </span>
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <Button
                key={area}
                variant="secondary"
                size="sm"
                onClick={() => rumbo.tasks.update(task, { area })}
              >
                {area}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 border-t pt-4">
        <Button variant="outline" onClick={() => rumbo.tasks.setDone(task, true)}>
          <CheckIcon data-icon="inline-start" />
          Ya está hecha
        </Button>
        <Button
          variant="ghost"
          className="text-destructive"
          onClick={() => rumbo.tasks.remove(task)}
        >
          <Trash2Icon data-icon="inline-start" />
          Borrar
        </Button>
        <Button variant="ghost" className="ml-auto" onClick={onSkip}>
          Saltar
        </Button>
      </div>
    </div>
  );
}
