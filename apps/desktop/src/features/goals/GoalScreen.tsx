import { useParams } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { InlineTitle } from "@/components/InlineTitle";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Breadcrumb } from "@/features/roadmaps/Breadcrumb";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { periodLabel } from "./goalLabels";
import { DeleteGoalButton } from "./page/DeleteGoalButton";
import { GoalKeyResults } from "./page/GoalKeyResults";
import { GoalObstacle } from "./page/GoalObstacle";
import { GoalPaceCard } from "./page/GoalPaceCard";
import { GoalLinks } from "./page/links/GoalLinks";
import { GoalPlan } from "./page/plan/GoalPlan";
import { GoalProgressCard } from "./page/GoalProgressCard";
import { GoalProperties } from "./page/GoalProperties";
import { GoalUpcoming } from "./page/GoalUpcoming";
import { GoalWhy } from "./page/GoalWhy";

/** Un objetivo abierto y editable en su sitio: el contenido a la izquierda, el resumen a la derecha. */
export function GoalScreen() {
  const rumbo = useRumbo();
  const id = Number(useParams<{ id: string }>().id);
  const summary = useVaultQuery((r) => r.goals.get(id), [id]).data;

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

  const { goal } = summary;
  const crumbs = [
    { label: "Objetivos", href: "/objetivos" },
    ...(goal.period ? [{ label: periodLabel(goal.period) }] : []),
    { label: goal.title },
  ];

  return (
    <>
      <ScreenHeader
        title={<Breadcrumb items={crumbs} />}
        actions={<DeleteGoalButton summary={summary} />}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto grid max-w-7xl items-start gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-8">
            <InlineTitle
              label="Título del objetivo"
              value={goal.title}
              onSave={(title) => void rumbo.goals.update(summary.id, { title })}
              className="-mx-2 block w-full px-2 py-1 text-3xl font-semibold tracking-tight"
            />
            <GoalWhy
              key={goal.why}
              why={goal.why}
              onSave={(why) => void rumbo.goals.update(summary.id, { why })}
            />
            <GoalKeyResults summary={summary} />
            <GoalPlan summary={summary} />
            <GoalLinks summary={summary} />
            <GoalObstacle goal={goal} />
          </div>
          <aside className="flex flex-col gap-4">
            <GoalProperties summary={summary} />
            <GoalProgressCard summary={summary} />
            <GoalPaceCard summary={summary} />
            <GoalUpcoming summary={summary} />
          </aside>
        </div>
      </main>
    </>
  );
}
