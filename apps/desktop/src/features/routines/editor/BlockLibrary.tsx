import { useDraggable } from "@dnd-kit/core";
import type { RoutineBlock, RoutineSummary } from "@rumbo/core";
import { GripVerticalIcon, LayoutGridIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/SegmentedControl";
import { STATUS_LABEL, STATUS_STYLE } from "@/features/roadmaps/moduleStatus";
import { Tag } from "@/features/roadmaps/Tag";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { cn } from "@/lib/utils";

export type LibraryTab = "modules" | "habits" | "tasks";

/** Algo que se puede soltar en la rutina: lo que se enseña y el bloque que crea. */
export interface LibraryItem {
  id: string;
  title: string;
  detail?: string;
  block: RoutineBlock;
  /** Etiqueta a la derecha: el estado del tema, o «En la rutina». */
  badge?: { label: string; className: string };
}

const TABS: { value: LibraryTab; label: string }[] = [
  { value: "modules", label: "Módulos" },
  { value: "habits", label: "Hábitos" },
  { value: "tasks", label: "Tareas" },
];

// Duración con la que entra un bloque si su hábito o su tarea no dicen otra.
const DEFAULT_MINUTES = 15;

interface BlockLibraryProps {
  summary: RoutineSummary;
  tab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
}

/** Biblioteca: temas de tus rutas, hábitos y tareas para arrastrar a la línea (o añadir con un clic). */
export function BlockLibrary({ summary, tab, onTabChange }: BlockLibraryProps) {
  const rumbo = useRumbo();
  const [query, setQuery] = useState("");
  const items = useLibraryItems(summary, tab);
  const visible = items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-medium">
          <LayoutGridIcon className="size-4 text-muted-foreground" />
          Biblioteca
        </h2>
        <span className="text-sm text-faint">arrastra a la línea</span>
      </div>
      <SegmentedControl label="Biblioteca" options={TABS} value={tab} onChange={onTabChange} />
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar…"
          className="pl-8"
        />
      </div>
      <ul className="flex max-h-96 flex-col gap-1.5 overflow-y-auto">
        {visible.map((item) => (
          <LibraryRow
            key={item.id}
            item={item}
            onAdd={() => rumbo.routines.addBlock(summary.id, item.block)}
          />
        ))}
        {visible.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">Nada por aquí</li>
        )}
      </ul>
    </Card>
  );
}

function LibraryRow({ item, onAdd }: { item: LibraryItem; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${item.id}`,
    data: { item },
  });

  return (
    <li
      ref={setNodeRef}
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-background/40 py-2 pr-2 pl-1.5",
        isDragging && "opacity-40",
      )}
    >
      <button
        type="button"
        aria-label={`Arrastrar ${item.title}`}
        className="cursor-grab touch-none rounded p-1 text-faint hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{item.title}</p>
        {item.detail && <p className="truncate text-xs text-muted-foreground">{item.detail}</p>}
      </div>
      {item.badge && (
        <Tag dot className={item.badge.className}>
          {item.badge.label}
        </Tag>
      )}
      <button
        type="button"
        aria-label={`Añadir ${item.title} al final`}
        onClick={onAdd}
        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
      >
        <PlusIcon className="size-4" />
      </button>
    </li>
  );
}

/** Lo que hay en cada pestaña, leído del vault. */
function useLibraryItems(summary: RoutineSummary, tab: LibraryTab): LibraryItem[] {
  const used = new Set(summary.routine.blocks.map((block) => block.ref).filter(Boolean));
  const inRoutine = { label: "En la rutina", className: "text-success" };

  return (
    useVaultQuery(
      (rumbo): LibraryItem[] => {
        if (tab === "habits") {
          return rumbo.habits.list().map(({ habit }) => {
            const ref = habit.key;
            const minutes =
              habit.kind === "duration" && habit.target ? habit.target : DEFAULT_MINUTES;
            return {
              id: `habit:${habit.key}`,
              title: habit.name,
              detail: habit.target ? `${habit.target} ${habit.unit ?? ""}`.trim() : undefined,
              block: { kind: "habit", ref, minutes },
              badge: used.has(ref) ? inRoutine : undefined,
            };
          });
        }

        if (tab === "tasks") {
          return rumbo.tasks
            .all()
            .filter((task) => !task.done)
            .map((task) => ({
              id: `task:${task.id}`,
              title: task.text,
              detail: task.scheduled ?? task.due,
              block: { kind: "task", title: task.text, minutes: DEFAULT_MINUTES },
            }));
        }

        return rumbo.learning.roadmaps().flatMap((roadmap) => [
          {
            id: roadmap.path,
            title: `Sigue «${roadmap.title}»`,
            detail: roadmap.current
              ? `Ahora: ${roadmap.current.title}`
              : "Cada día, el tema en curso",
            block: { kind: "module", ref: `[[${roadmap.name}]]`, minutes: 45 },
            badge: used.has(`[[${roadmap.name}]]`) ? inRoutine : undefined,
          },
          ...roadmap.modules.map((module) => {
            const ref = `[[${module.name}]]`;
            return {
              id: module.path,
              title: `${String(module.order).padStart(2, "0")} · ${module.title}`,
              detail: roadmap.title,
              block: { kind: "module" as const, ref, minutes: 45 },
              badge: used.has(ref)
                ? inRoutine
                : { label: STATUS_LABEL[module.status], className: STATUS_STYLE[module.status] },
            };
          }),
        ]);
      },
      [tab, summary],
    ).data ?? []
  );
}
