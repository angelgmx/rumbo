import { TargetIcon } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { GoalDetailDock } from "./detail/GoalDetailDock";
import { GoalBoard } from "./GoalBoard";
import { GoalList } from "./GoalList";
import { NewGoalButton } from "./NewGoalButton";

type View = "board" | "list";

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Tablero" },
  { value: "list", label: "Lista" },
];

/** Los objetivos en lista o tablero; al abrir uno, su panel entra a la derecha. */
export function GoalsScreen() {
  const goals = useVaultQuery((r) => r.goals.list()).data ?? [];
  const [view, setView] = useState<View>("list");
  const [, navigate] = useLocation();
  const { id } = useParams<{ id?: string }>();
  const selected = goals.find((summary) => summary.id === Number(id));

  return (
    <>
      <ScreenHeader title="Objetivos" newTask={false} actions={<NewGoalButton />} />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Objetivos</h1>
              <p className="mt-1 text-muted-foreground">
                {goals.length === 0
                  ? "Resultados que quieres en una fecha"
                  : `${goals.filter(({ goal }) => goal.status === "active").length} en marcha`}
              </p>
            </div>
            {goals.length > 0 && (
              <SegmentedControl label="Vista" options={VIEWS} value={view} onChange={setView} />
            )}
          </div>

          {goals.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TargetIcon />
                </EmptyMedia>
                <EmptyTitle>Todavía no tienes objetivos</EmptyTitle>
                <EmptyDescription>Crea el primero con «Nuevo objetivo».</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : view === "board" ? (
            <GoalBoard goals={goals} />
          ) : (
            <GoalList goals={goals} selectedId={selected?.id} />
          )}
        </main>
        <GoalDetailDock summary={selected} onClose={() => navigate("/objetivos")} />
      </div>
    </>
  );
}
