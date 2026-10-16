import type { GoalSummary } from "@rumbo/core";
import {
  BookOpenIcon,
  FileTextIcon,
  FlameIcon,
  FolderKanbanIcon,
  LinkIcon,
  ListChecksIcon,
  WaypointsIcon,
} from "lucide-react";
import { useVaultRoot } from "@/app/VaultGate";
import { useRumbo } from "@/app/RumboContext";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { roadmapHref } from "@/features/roadmaps/links";
import { TaskRow } from "@/features/tasks/TaskRow";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { percent } from "../goalLabels";
import { openInObsidian } from "@/platform/openInObsidian";
import { openUrl } from "@/platform/openUrl";
import { RelationRow } from "./RelationRow";
import { RelationSection } from "./RelationSection";

/** Todo lo vinculado al objetivo, ya filtrado a él. Sin nada vinculado: «Sin plan». */
export function GoalRelations({ summary }: { summary: GoalSummary }) {
  const { tasks, projects, habits, roadmaps, notes, goal } = summary;
  const empty = [tasks, projects, habits, roadmaps, notes, goal.resources].every(
    (items) => items.length === 0,
  );

  if (empty) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WaypointsIcon />
          </EmptyMedia>
          <EmptyTitle>Sin plan</EmptyTitle>
          <EmptyDescription>
            Conecta proyectos, hábitos, rutas o notas desde «Editar» y aquí verás qué lo empuja.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TasksSection summary={summary} />
      <ProjectsSection summary={summary} />
      <HabitsSection summary={summary} />
      <RoadmapsSection summary={summary} />
      <NotesSection summary={summary} />
      <ResourcesSection summary={summary} />
    </div>
  );
}

function TasksSection({ summary: { tasks } }: { summary: GoalSummary }) {
  const rumbo = useRumbo();
  const panel = useTaskPanel();
  const today = rumbo.daily.today();
  if (tasks.length === 0) return null;

  return (
    <RelationSection icon={ListChecksIcon} title="Tareas" count={tasks.length}>
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={today}
          onToggle={(done) => void rumbo.tasks.setDone(task, done)}
          onOpen={() => panel.edit(task)}
        />
      ))}
    </RelationSection>
  );
}

function ProjectsSection({ summary: { projects } }: { summary: GoalSummary }) {
  if (projects.length === 0) return null;

  return (
    <RelationSection icon={FolderKanbanIcon} title="Proyectos" count={projects.length}>
      {projects.map(({ id, project, progress }) => (
        <RelationRow key={id} title={project.title} detail={percent(progress)} />
      ))}
    </RelationSection>
  );
}

function HabitsSection({ summary: { habits } }: { summary: GoalSummary }) {
  if (habits.length === 0) return null;

  return (
    <RelationSection icon={FlameIcon} title="Hábitos" count={habits.length}>
      {habits.map(({ habit, last30Days }) => (
        <RelationRow
          key={habit.key}
          title={habit.name}
          detail={`${percent(last30Days)} en 30 días`}
          href="/habitos"
        />
      ))}
    </RelationSection>
  );
}

function RoadmapsSection({ summary: { roadmaps } }: { summary: GoalSummary }) {
  const topics = useVaultQuery((r) => r.learning.topics()).data ?? [];
  if (roadmaps.length === 0) return null;

  return (
    <RelationSection icon={BookOpenIcon} title="Rutas" count={roadmaps.length}>
      {roadmaps.map(({ name, title, mastered, modules }) => {
        const topic = topics.find(({ roadmap }) => roadmap?.name === name);
        return (
          <RelationRow
            key={name}
            title={title}
            detail={`${mastered} de ${modules.length} temas`}
            href={topic && roadmapHref(topic.path)}
          />
        );
      })}
    </RelationSection>
  );
}

function NotesSection({ summary: { notes } }: { summary: GoalSummary }) {
  const root = useVaultRoot();
  if (notes.length === 0) return null;

  return (
    <RelationSection icon={FileTextIcon} title="Notas" count={notes.length}>
      {notes.map(({ path, name }) => (
        <RelationRow key={path} title={name} onOpen={() => void openInObsidian(root, path)} />
      ))}
    </RelationSection>
  );
}

function ResourcesSection({ summary: { goal } }: { summary: GoalSummary }) {
  const { resources } = goal;
  if (resources.length === 0) return null;

  return (
    <RelationSection icon={LinkIcon} title="Recursos" count={resources.length}>
      {resources.map(({ title, url, source }) => (
        <RelationRow
          key={`${title}-${url}`}
          title={title}
          detail={source}
          onOpen={url ? () => void openUrl(url) : undefined}
        />
      ))}
    </RelationSection>
  );
}
