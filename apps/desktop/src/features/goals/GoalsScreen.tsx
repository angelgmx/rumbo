import { TargetIcon } from "lucide-react";
import { useState } from "react";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FilterChip } from "@/features/tasks/FilterChip";
import { AreaDot } from "@/features/tasks/AreaDot";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { GoalBoard } from "./GoalBoard";
import { GoalsByPeriod } from "./GoalsByPeriod";
import { GoalTable } from "./GoalTable";
import { NewGoalButton } from "./NewGoalButton";

type View = "board" | "list" | "period";

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Tablero" },
  { value: "list", label: "Lista" },
  { value: "period", label: "Por periodo" },
];

export function GoalsScreen() {
  const goals = useVaultQuery((r) => r.goals.list()).data;
  const [view, setView] = useState<View>("board");
  const [area, setArea] = useState<string>();

  if (!goals) return <ScreenHeader title="Objetivos" actions={<NewGoalButton />} />;

  const areas = [...new Set(goals.flatMap(({ goal }) => goal.area ?? []))].sort();
  const shown = area ? goals.filter(({ goal }) => goal.area === area) : goals;

  return (
    <>
      <ScreenHeader title="Objetivos" actions={<NewGoalButton />} />
      <main className="flex min-h-0 flex-1 flex-col gap-5 p-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Objetivos</h1>
          <p className="mt-1 text-muted-foreground">
            {goals.length === 0
              ? "Resultados que quieres en una fecha"
              : `${goals.filter(({ goal }) => goal.status === "active").length} en marcha de ${goals.length}`}
          </p>
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
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl label="Vista" options={VIEWS} value={view} onChange={setView} />
              <FilterChip
                label="Área"
                value={area}
                onChange={setArea}
                options={areas.map((name) => ({
                  value: name,
                  count: goals.filter(({ goal }) => goal.area === name).length,
                  icon: <AreaDot area={name} />,
                }))}
              />
            </div>
            {view === "board" && <GoalBoard goals={shown} />}
            {view === "list" && <GoalTable goals={shown} />}
            {view === "period" && <GoalsByPeriod goals={shown} />}
          </>
        )}
      </main>
    </>
  );
}
