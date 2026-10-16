import type { OrganizeSuggestion } from "@rumbo/core";
import { SparklesIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { describeCompletion } from "./describeCompletion";
import type { TaskOptions } from "./useTaskOptions";

/** Lo que la IA añadiría a la tarea, resaltado, con «Aplicar» y «Descartar». */
export function CompletionSummary({
  suggestion,
  names,
  onApply,
  onDiscard,
}: {
  suggestion: OrganizeSuggestion;
  names: TaskOptions;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const today = useRumbo().daily.today();
  const entries = describeCompletion(suggestion.proposal, names, today);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary-soft p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SparklesIcon className="size-4 text-primary-text" />
        La IA añadiría
      </div>
      <dl className="flex flex-col gap-1.5 text-sm">
        {entries.map(({ label, values }) => (
          <div key={label} className="flex gap-3">
            <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="flex min-w-0 flex-col">
              {values.map((value) => (
                <span key={value} className="truncate">
                  {value}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDiscard}>
          Descartar
        </Button>
        <Button size="sm" onClick={onApply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
