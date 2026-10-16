import type { Task } from "@rumbo/core";
import { AreaDot } from "@/features/tasks/AreaDot";
import { areaOf } from "@/features/tasks/taskFilters";

/** El área, lo que haces y, si la tarea tiene pasos, el paso de ahora. */
export function FocusModeHeading({ title, task }: { title: string; task?: Task }) {
  const area = task && areaOf(task);
  const step = task?.steps.find((candidate) => !candidate.done);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {area && (
        <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm">
          <AreaDot area={area} />
          {area}
        </span>
      )}
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      {step && <p className="text-muted-foreground">Ahora: {step.text}</p>}
    </div>
  );
}
