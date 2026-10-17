import type { Habit, HabitInput } from "@rumbo/core";
import { useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { PanelFooter } from "@/components/panel/PanelFooter";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { SidePanel } from "@/components/panel/SidePanel";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Switch } from "@/components/ui/switch";
import { useHabitLook } from "@/hooks/useHabitLook";
import { HabitAmount } from "./HabitAmount";
import { HabitProperties } from "./HabitProperties";
import { useHabitDraft } from "./useHabitDraft";

const KINDS: { value: HabitInput["kind"]; label: string }[] = [
  { value: "check", label: "Sí o no" },
  { value: "count", label: "Cantidad" },
  { value: "duration", label: "Tiempo" },
  { value: "tasks", label: "Con tareas" },
];

/** Crear un hábito o, con `habit`, editarlo: en el panel lateral, igual que las tareas. */
export function HabitPanel({
  open,
  habit,
  initial,
  onClose,
}: {
  open: boolean;
  habit?: Habit;
  /** Lo que ya se sabe de un hábito nuevo, por ejemplo la franja marcada en el calendario. */
  initial?: Partial<HabitInput>;
  onClose: () => void;
}) {
  return (
    <SidePanel open={open} title={habit ? "Editar hábito" : "Nuevo hábito"} onClose={onClose}>
      {open && <HabitPanelContent habit={habit} initial={initial} onClose={onClose} />}
    </SidePanel>
  );
}

function HabitPanelContent({
  habit,
  initial,
  onClose,
}: {
  habit?: Habit;
  initial?: Partial<HabitInput>;
  onClose: () => void;
}) {
  const rumbo = useRumbo();
  const { draft, patch, reset, problem } = useHabitDraft(habit, initial);
  const [another, setAnother] = useState(false);
  const look = useHabitLook({ ...draft, key: "", archived: false });

  async function save() {
    if (problem) return;
    if (habit) {
      await rumbo.habits.update(habit.key, draft);
      toast.success("Hábito guardado");
      onClose();
      return;
    }
    await rumbo.habits.create(draft);
    toast.success(`«${draft.name.trim()}» creado`);
    if (another) reset();
    else onClose();
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
      <PanelHeader crumbs={["Hábitos", habit ? habit.name : "Nuevo hábito"]} onClose={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: look.color }} />
            <input
              autoFocus={!habit}
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="Gym, Inglés, Leer…"
              aria-label="Nombre del hábito"
              className="min-w-0 flex-1 bg-transparent text-2xl leading-10 font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="pl-6 text-sm text-muted-foreground">
            Algo que repites. Rumbo te dice cuándo toca y lleva la racha.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <SectionLabel>Cómo se cumple</SectionLabel>
          <SegmentedControl
            label="Cómo se cumple"
            options={KINDS}
            value={draft.kind}
            onChange={(kind) => patch({ kind })}
          />
          <HabitAmount draft={draft} onChange={patch} />
        </section>

        <HabitProperties
          draft={draft}
          started={habit?.started ?? rumbo.daily.today()}
          onChange={patch}
        />
      </div>
      <PanelFooter
        label={habit ? "Guardar cambios" : "Crear hábito"}
        disabled={problem !== undefined}
        onSubmit={() => void save()}
      >
        {habit ? (
          problem && <span className="text-sm text-muted-foreground">{problem}</span>
        ) : (
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={another} onCheckedChange={setAnother} />
            Crear otro
          </label>
        )}
      </PanelFooter>
    </div>
  );
}
