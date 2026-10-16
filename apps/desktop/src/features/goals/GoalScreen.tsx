import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { InlineTitle } from "@/components/InlineTitle";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Breadcrumb } from "@/features/roadmaps/Breadcrumb";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { daysLeftLabel, periodLabel } from "./goalLabels";
import { GoalPanel } from "./panel/GoalPanel";
import { DeleteGoalButton } from "./page/DeleteGoalButton";
import { GoalKeyResults } from "./page/GoalKeyResults";
import { GoalObstacle } from "./page/GoalObstacle";
import { GoalProperties } from "./page/GoalProperties";
import { GoalRelations } from "./page/GoalRelations";
import { GoalWhy } from "./page/GoalWhy";

/** Un objetivo abierto: sus propiedades, su porqué, su métrica y todo lo que lo empuja. */
export function GoalScreen() {
  const rumbo = useRumbo();
  const id = Number(useParams<{ id: string }>().id);
  const summary = useVaultQuery((r) => r.goals.get(id), [id]).data;
  const [editing, setEditing] = useState(false);

  if (!summary) {
    return (
      <>
        <ScreenHeader title={<Breadcrumb items={[{ label: "Objetivos", href: "/objetivos" }]} />} />
        <main className="flex-1 p-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No encuentro este objetivo</EmptyTitle>
              <EmptyDescription>Puede que lo hayas eliminado.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </main>
      </>
    );
  }

  const { goal, daysLeft } = summary;
  const crumbs = [
    { label: "Objetivos", href: "/objetivos" },
    ...(goal.period ? [{ label: periodLabel(goal.period) }] : []),
    { label: goal.title },
  ];

  return (
    <>
      <ScreenHeader
        title={<Breadcrumb items={crumbs} />}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <PencilIcon data-icon="inline-start" />
              Editar
            </Button>
            <DeleteGoalButton summary={summary} />
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div>
            <InlineTitle
              label="Título del objetivo"
              value={goal.title}
              onSave={(title) => void rumbo.goals.update(summary.id, { title })}
              className="block w-full px-2 py-1 text-3xl font-semibold tracking-tight"
            />
            {daysLeft !== undefined && goal.status === "active" && (
              <p className="mt-1 px-2 text-muted-foreground">{daysLeftLabel(daysLeft)}</p>
            )}
          </div>
          <GoalProperties summary={summary} />
          <GoalWhy
            key={goal.why}
            why={goal.why}
            onSave={(why) => void rumbo.goals.update(summary.id, { why })}
          />
          <GoalKeyResults summary={summary} />
          <GoalObstacle goal={goal} />
          <GoalRelations summary={summary} />
        </div>
      </main>
      <GoalPanel open={editing} goal={summary} onClose={() => setEditing(false)} />
    </>
  );
}
