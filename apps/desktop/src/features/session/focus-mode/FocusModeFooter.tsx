import type { Task } from "@rumbo/core";
import { StepsBar } from "@/features/tasks/StepsBar";

/** Abajo, sin robar la atención: cómo va la tarea y qué viene después en el día. */
export function FocusModeFooter({
  task,
  next,
}: {
  task?: Task;
  next?: { start: string; title: string };
}) {
  const steps = task?.steps ?? [];
  const done = steps.filter((step) => step.done).length;

  return (
    <footer className="flex items-end justify-between gap-6">
      {steps.length > 0 ? (
        <div className="flex items-center gap-4 rounded-xl border bg-card/60 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Progreso</span>
          <StepsBar done={done} total={steps.length} className="w-24" />
          <span className="font-mono">
            {done} / {steps.length} pasos
          </span>
        </div>
      ) : (
        <span />
      )}
      {next && (
        <p className="rounded-xl border bg-card/60 px-4 py-3 text-sm text-muted-foreground">
          Siguiente · {next.start} {next.title}
        </p>
      )}
    </footer>
  );
}
