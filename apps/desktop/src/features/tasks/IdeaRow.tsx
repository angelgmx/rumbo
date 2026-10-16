import type { Idea } from "@rumbo/core";
import { ArrowRightIcon, Trash2Icon } from "lucide-react";
import { InlineTitle } from "@/components/InlineTitle";
import { Button } from "@/components/ui/button";
import { formatDayMonth } from "@/lib/format";

/** Una idea con su fecha: se edita en su sitio, se pasa a tarea o se borra. */
export function IdeaRow({
  idea,
  onEdit,
  onConvert,
  onRemove,
}: {
  idea: Idea;
  onEdit: (text: string) => void;
  onConvert: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors duration-(--dur-fast) hover:bg-muted/40">
      <InlineTitle
        label="Texto de la idea"
        value={idea.text}
        onSave={onEdit}
        className="-mx-1 min-w-0 flex-1 truncate px-1"
      />
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
