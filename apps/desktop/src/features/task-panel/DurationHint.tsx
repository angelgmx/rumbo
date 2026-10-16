import { endTime, type TaskDraft } from "@rumbo/core";
import { TriangleAlertIcon } from "lucide-react";
import { useVaultQuery } from "@/hooks/useVaultQuery";

// El ámbar del aviso se oscurece (en claro) o se aclara (en oscuro) hasta pasar AA en texto pequeño.
const WARNING = "text-[color-mix(in_oklab,var(--warning),var(--foreground)_45%)]";

/** Con día, hora y duración: cuándo termina y, si pisa algo de ese día, un aviso (no cambia nada). */
export function DurationHint({ draft, taskId }: { draft: TaskDraft; taskId: number | undefined }) {
  const { scheduled, time, duration } = draft;
  const clash = useVaultQuery(
    (rumbo) => rumbo.taskClashes.clash({ scheduled, time, duration }, taskId),
    [scheduled, time, duration, taskId],
  ).data;

  if (!scheduled || !time || !duration) return null;

  return (
    <div className="flex flex-col gap-1 text-xs">
      <p className="text-muted-foreground">Termina {endTime(time, duration)}</p>
      {clash && (
        <p className={`flex items-center gap-1.5 ${WARNING}`}>
          <TriangleAlertIcon className="size-3.5 shrink-0" />
          Choca con {clash.title} a las {clash.start}
        </p>
      )}
    </div>
  );
}
