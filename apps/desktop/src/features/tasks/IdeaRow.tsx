import type { Idea } from "@rumbo/core";
import { ArrowRightIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDayMonth } from "@/lib/format";

/** Una idea con su fecha y las dos cosas que se hacen con ella: pasarla a tarea o borrarla. */
export function IdeaRow({
  idea,
  onConvert,
  onRemove,
}: {
  idea: Idea;
  onConvert: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors duration-(--dur-fast) hover:bg-muted/40">
      <span className="min-w-0 flex-1 truncate">{idea.text}</span>
      {idea.created && (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDayMonth(idea.created)}
        </span>
      )}
      <Button variant="outline" size="sm" onClick={onConvert}>
        <ArrowRightIcon data-icon="inline-start" />
        Convertir en tarea
      </Button>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        <Trash2Icon data-icon="inline-start" />
        Borrar
      </Button>
    </div>
  );
}
