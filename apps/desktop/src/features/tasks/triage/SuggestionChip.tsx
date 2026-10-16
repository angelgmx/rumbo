import type { TriageKind, TriageSuggestion } from "@rumbo/core";
import { BotIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeDay } from "@/lib/format";
import { AreaDot } from "../AreaDot";

const KIND_LABEL: Record<TriageKind, string> = {
  task: "Tarea",
  idea: "Idea",
  project: "Proyecto",
  goal: "Objetivo",
};

interface SuggestionChipProps {
  suggestion: TriageSuggestion;
  today: string;
  onAccept: () => void;
  onDismiss: () => void;
}

/** Lo que propone la IA para una tarea, tal como quedará: se acepta o se descarta. */
export function SuggestionChip({ suggestion, today, onAccept, onDismiss }: SuggestionChipProps) {
  const { kind, title, area, date } = suggestion.proposal;
  const renamed = (kind === "project" || kind === "goal") && title !== suggestion.task.text;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="flex h-8 max-w-80 items-center gap-2 rounded-lg border border-primary/40 bg-primary-soft px-2.5 text-sm">
        <BotIcon className="size-3.5 shrink-0 text-primary-text" />
        <span className="font-medium">{KIND_LABEL[kind]}</span>
        {renamed && <span className="truncate">«{title}»</span>}
        {area && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <AreaDot area={area} />
            {area}
          </span>
        )}
        {date && <span className="text-muted-foreground">· {formatRelativeDay(date, today)}</span>}
      </span>
      <Button size="icon-sm" aria-label="Aceptar la propuesta" onClick={onAccept}>
        <CheckIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Descartar la propuesta"
        onClick={onDismiss}
      >
        <XIcon />
      </Button>
    </div>
  );
}
