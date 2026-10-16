import type { GoalDriverRefs } from "@rumbo/core";
import { BookOpenIcon, FileTextIcon, FlameIcon, FolderKanbanIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { DriverPicker } from "./DriverPicker";
import { StepSection } from "./StepSection";

/** Paso 5: cómo llegarás. Se conecta lo que ya existe: proyectos, hábitos, rutas y notas. */
export function StepDrivers({
  goalId,
  drivers,
  onChange,
}: {
  /** El objetivo que se edita; sin él, uno nuevo. */
  goalId: number | undefined;
  drivers: GoalDriverRefs;
  onChange: (changes: Partial<GoalDriverRefs>) => void;
}) {
  const { projects, habits, learning, store, goals } = useRumbo();
  // Un proyecto o un hábito empuja un solo objetivo: si ya tiene otro, se avisa.
  const titles = new Map(goals.list().map(({ id, goal }) => [id, goal.title]));
  const elsewhere = (owner: number | undefined) =>
    owner === undefined || owner === goalId ? undefined : titles.get(owner);

  return (
    <StepSection
      step={5}
      title="¿Cómo vas a llegar?"
      hint="Conecta lo que ya existe; lo que no, créalo en su pantalla."
      done={Object.values(drivers).some((chosen) => chosen.length > 0)}
    >
      <DriverPicker
        icon={FolderKanbanIcon}
        title="Proyectos"
        addLabel="Añadir proyecto"
        options={projects.list().map(({ id, project }) => ({
          value: String(id),
          label: project.title,
          hint: elsewhere(project.goalId),
        }))}
        chosen={drivers.projects.map(String)}
        onChange={(chosen) => onChange({ projects: chosen.map(Number) })}
      />
      <DriverPicker
        icon={FlameIcon}
        title="Hábitos"
        addLabel="Añadir hábito"
        options={habits.list().map(({ habit }) => ({
          value: habit.key,
          label: habit.name,
          hint: elsewhere(habit.goalId),
        }))}
        chosen={drivers.habits}
        onChange={(chosen) => onChange({ habits: chosen })}
      />
      <DriverPicker
        icon={BookOpenIcon}
        title="Rutas"
        addLabel="Añadir ruta"
        options={learning.roadmaps().map(({ name, title }) => ({ value: name, label: title }))}
        chosen={drivers.roadmaps}
        onChange={(chosen) => onChange({ roadmaps: chosen })}
      />
      <DriverPicker
        icon={FileTextIcon}
        title="Notas"
        addLabel="Añadir nota"
        options={store
          .allNotes()
          .filter((note) => note.data.type === undefined || note.data.type === "note")
          .map(({ name }) => ({ value: name, label: name }))}
        chosen={drivers.notes}
        onChange={(chosen) => onChange({ notes: chosen })}
      />
    </StepSection>
  );
}
