import type { HabitInput, HabitSchedule, IsoDate } from "@rumbo/core";
import { minutesBetween } from "@rumbo/core";
import { CheckIcon, InfoIcon } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useRumbo } from "@/app/RumboContext";
import { OptionSelect } from "@/components/OptionSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Kbd } from "@/components/ui/kbd";
import { Switch } from "@/components/ui/switch";
import type { HabitKind } from "./habitKinds";
import { ChallengePicker } from "./ChallengePicker";
import { KindPicker } from "./KindPicker";
import { SchedulePicker } from "./SchedulePicker";
import { TimeRangePicker } from "./TimeRangePicker";

interface HabitFormProps {
  initial?: HabitInput;
  /** Desde cuándo cuenta el hábito; si es nuevo, hoy. Sirve para calcular el fin de un reto. */
  started?: IsoDate;
  submitLabel: string;
  onSubmit: (input: HabitInput) => Promise<void>;
  onCancel: () => void;
}

/** Formulario de un hábito, el mismo para crear y para editar. */
export function HabitForm({ initial, started, submitLabel, onSubmit, onCancel }: HabitFormProps) {
  const rumbo = useRumbo();
  const areas = rumbo.store.notesOfType("area").map((note) => String(note.data.name ?? note.name));
  // El enlace usa el nombre del fichero; lo que se enseña es el título.
  const goals = rumbo.store
    .notesOfType("goal")
    .map((note) => ({ label: String(note.data.title ?? note.name), value: note.name }));

  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<HabitKind>(initial?.kind ?? "check");
  const [target, setTarget] = useState(initial?.target ?? 20);
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [schedule, setSchedule] = useState<HabitSchedule>(initial?.schedule ?? "daily");
  const [hasTime, setHasTime] = useState(Boolean(initial?.start));
  const [range, setRange] = useState({
    start: initial?.start ?? "07:00",
    end: initial?.end ?? "08:00",
  });
  const [area, setArea] = useState<string | null>(initial?.area ?? null);
  const [goal, setGoal] = useState<string | null>(initial?.goal ?? null);
  const [until, setUntil] = useState<IsoDate | undefined>(initial?.until);

  const problem = findProblem();

  function findProblem(): string | undefined {
    if (!name.trim()) return "Ponle un nombre";
    if ((kind === "count" || kind === "duration") && target <= 0)
      return "El objetivo tiene que ser mayor que 0";
    if (Array.isArray(schedule) && schedule.length === 0) return "Elige al menos un día";
    if (hasTime && minutesBetween(range.start, range.end) <= 0)
      return "La hora de fin va después del inicio";
    return undefined;
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (problem) return;
    await onSubmit({
      name,
      kind,
      target: kind === "count" || kind === "duration" ? target : undefined,
      unit: kind === "duration" ? "min" : kind === "count" ? unit.trim() || "veces" : undefined,
      schedule,
      start: hasTime ? range.start : undefined,
      end: hasTime ? range.end : undefined,
      area: area ?? undefined,
      goal: goal ?? undefined,
      until,
    });
  }

  // Ctrl Enter guarda desde cualquier campo.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) void submit();
  }

  return (
    <form onSubmit={submit} onKeyDown={onKeyDown} className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-7 overflow-y-auto px-6 py-5">
        <Section number={1} title="¿Qué hábito quieres tener?">
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Gym, Inglés, Leer…"
            aria-label="Nombre del hábito"
            className="h-11 text-base"
          />
        </Section>

        <Section number={2} title="¿Cómo sabes que lo has hecho?">
          <KindPicker value={kind} onChange={setKind} />
          {kind === "tasks" && (
            <Alert>
              <InfoIcon />
              <AlertDescription>
                Cada día añades las tareas concretas dentro del hábito (en Hoy o en Tareas). Cuando
                las terminas todas, el hábito cuenta como hecho. Más adelante, tu ruta de
                aprendizaje las creará sola.
              </AlertDescription>
            </Alert>
          )}
          {kind === "count" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Cada día</span>
              <Input
                type="number"
                min={1}
                className="w-24"
                aria-label="Cantidad"
                value={target}
                onChange={(event) => setTarget(Number(event.target.value))}
              />
              <Input
                className="w-48"
                aria-label="Unidad"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="páginas, vasos, flexiones…"
              />
            </div>
          )}
          {kind === "duration" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Cada día</span>
              <InputGroup className="w-32">
                <InputGroupInput
                  type="number"
                  min={1}
                  aria-label="Minutos"
                  value={target}
                  onChange={(event) => setTarget(Number(event.target.value))}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>min</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
          )}
        </Section>

        <Section number={3} title="¿Qué días?" hint="Los días que no tocan no rompen la racha.">
          <SchedulePicker value={schedule} onChange={setSchedule} />
        </Section>

        <Section
          number={4}
          title="¿Hasta cuándo?"
          hint="Un reto con fin ayuda a empezar. Al terminar, deja de salir en tu día."
        >
          <ChallengePicker
            started={started ?? rumbo.daily.today()}
            until={until}
            onChange={setUntil}
          />
        </Section>

        <Section
          number={5}
          title="¿A qué hora?"
          hint="Con franja horaria, el hábito sale en «Tu día» como parte de tu rutina."
          action={
            <Switch checked={hasTime} onCheckedChange={setHasTime} aria-label="Tiene hora fija" />
          }
        >
          {hasTime && <TimeRangePicker value={range} onChange={setRange} />}
        </Section>

        <Section
          number={6}
          title="¿Para qué es?"
          hint="El objetivo al que te acerca y el área donde se ve."
        >
          <div className="grid grid-cols-2 gap-3">
            <OptionSelect
              options={[{ label: "Sin objetivo", value: null }, ...goals]}
              value={goal}
              onChange={setGoal}
            />
            <OptionSelect
              options={[
                { label: "Sin área", value: null },
                ...areas.map((areaName) => ({ label: areaName, value: areaName })),
              ]}
              value={area}
              onChange={setArea}
            />
          </div>
        </Section>
      </div>

      <footer className="flex items-center gap-3 border-t bg-muted/40 px-6 py-4">
        <span className="text-sm text-muted-foreground">
          {problem ?? (
            <>
              <Kbd>Ctrl Enter</Kbd> para guardar
            </>
          )}
        </span>
        <Button type="button" variant="ghost" className="ml-auto" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={problem !== undefined}>
          <CheckIcon data-icon="inline-start" />
          {submitLabel}
        </Button>
      </footer>
    </form>
  );
}

interface SectionProps {
  number: number;
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}

function Section({ number, title, hint, action, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
          {number}
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          <h3 className="font-medium">{title}</h3>
          {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-3 pl-9">{children}</div>
    </section>
  );
}
