import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { isRoutineOn, linkTarget, type RoutineSummary } from "@rumbo/core";
import { ChevronLeftIcon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import { timeOf, useNow } from "@/hooks/useNow";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { useRoutineLook } from "../look";
import { useRoutinePurpose } from "../useRoutinePurpose";
import { useStartRoutine } from "../useStartRoutine";
import { BlockLibrary, type LibraryItem, type LibraryTab } from "./BlockLibrary";
import { BLOCK_LIST_ID, BlockList } from "./BlockList";
import { InlineTitle } from "./InlineTitle";
import { RoutineOverview } from "./RoutineOverview";
import { RoutineSettings } from "./RoutineSettings";

/** Editor de una rutina: sus días y su hora, los bloques en orden y la biblioteca para añadir más. */
export function RoutineEditorScreen() {
  const { routine: encoded = "" } = useParams<{ routine: string }>();
  const path = decodeURIComponent(encoded);
  const summary = useVaultQuery(
    (rumbo) => rumbo.routines.list().routines.find((item) => item.path === path),
    [path],
  ).data;

  if (!summary) {
    return (
      <>
        <ScreenHeader title={<Crumbs />} />
        <main className="flex-1 p-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No encuentro esta rutina</EmptyTitle>
              <EmptyDescription>
                Puede que la nota se haya movido o borrado en Obsidian.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </main>
      </>
    );
  }
  return <Editor summary={summary} />;
}

function Editor({ summary }: { summary: RoutineSummary }) {
  const rumbo = useRumbo();
  const look = useRoutineLook(summary.routine);
  const purpose = useRoutinePurpose(summary);
  const start = useStartRoutine();
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("modules");
  const currentIndex = useCurrentBlock(summary);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const target = indexOf(String(over.id)) ?? summary.blocks.length;
    const item = active.data.current?.item as LibraryItem | undefined;
    if (item) {
      rumbo.routines.addBlock(summary.path, item.block, target);
      return;
    }
    const from = indexOf(String(active.id));
    if (from !== undefined && over.id !== BLOCK_LIST_ID && from !== target) {
      rumbo.routines.moveBlock(summary.path, from, target);
    }
  }

  return (
    <>
      <ScreenHeader
        title={<Crumbs title={summary.title} />}
        actions={
          <Button variant="outline" onClick={() => start(summary, { goToFocus: false })}>
            <PlayIcon data-icon="inline-start" />
            Probar hoy
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="mt-1.5"
              aria-label="Volver"
              render={<Link href="/rutinas" />}
            >
              <ChevronLeftIcon />
            </Button>
            <AreaIcon area={look} className="mt-0.5 size-11 rounded-xl [&_svg]:size-5" />
            <div className="min-w-0 flex-1">
              <InlineTitle
                label="Nombre de la rutina"
                value={summary.title}
                onSave={(title) => rumbo.routines.update(summary.path, { title })}
                className="-mx-1 px-1 text-3xl font-semibold tracking-tight"
              />
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[linkTarget(summary.routine.area), purpose].filter(Boolean).join(" · ")}
              </p>
            </div>
            <label className="mt-2 flex items-center gap-2.5 text-sm">
              {summary.routine.active ? "Activa" : "Pausada"}
              <Switch
                checked={summary.routine.active}
                onCheckedChange={(active) => rumbo.routines.setActive(summary.path, active)}
              />
            </label>
          </div>

          <RoutineSettings summary={summary} />

          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <div className="grid grid-cols-[1fr_22rem] items-start gap-5">
              <BlockList
                summary={summary}
                routineColor={look.color}
                currentIndex={currentIndex}
                onPickFromLibrary={setLibraryTab}
              />
              <div className="flex flex-col gap-5">
                <RoutineOverview summary={summary} color={look.color} />
                <BlockLibrary summary={summary} tab={libraryTab} onTabChange={setLibraryTab} />
              </div>
            </div>
          </DndContext>
        </div>
      </main>
    </>
  );
}

function Crumbs({ title }: { title?: string }) {
  return (
    <span className="flex items-center gap-2">
      <Link href="/rutinas" className="text-muted-foreground hover:text-foreground">
        Rutinas
      </Link>
      {title && (
        <>
          <span className="text-faint">›</span>
          <span>{title}</span>
        </>
      )}
    </span>
  );
}

/** El bloque que toca ahora, si la rutina es de hoy y ya ha empezado. */
function useCurrentBlock(summary: RoutineSummary): number | undefined {
  const rumbo = useRumbo();
  const now = timeOf(useNow());
  if (!isRoutineOn(summary.routine, rumbo.daily.today())) return undefined;
  return summary.blocks.find((block) => block.start <= now && now < block.end)?.index;
}

function indexOf(id: string): number | undefined {
  const match = /^block:(\d+)$/.exec(id);
  return match ? Number(match[1]) : undefined;
}
