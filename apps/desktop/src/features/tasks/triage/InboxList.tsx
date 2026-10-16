import type { Task } from "@rumbo/core";
import type { ComponentProps } from "react";
import { TaskList } from "../TaskList";
import { SuggestionChip } from "./SuggestionChip";
import type { InboxTriage } from "./useInboxTriage";

type InboxListProps = ComponentProps<typeof TaskList> & {
  triage: InboxTriage;
};

/** La lista del Inbox con la propuesta de la IA al final de cada fila, si la hay. */
export function InboxList({ triage, today, aside: other, ...props }: InboxListProps) {
  function aside(task: Task) {
    const suggestion = triage.forTask(task);
    if (!suggestion) return other?.(task);
    return (
      <SuggestionChip
        suggestion={suggestion}
        today={today}
        onAccept={() => triage.accept(suggestion)}
        onDismiss={() => triage.dismiss(suggestion)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {triage.hasSuggestions && (
        <p className="text-right text-sm text-muted-foreground">
          La IA sugiere qué es cada cosa · acepta con un clic
        </p>
      )}
      <TaskList today={today} {...props} aside={aside} />
    </div>
  );
}
