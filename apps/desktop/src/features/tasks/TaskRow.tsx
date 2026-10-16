import type { Task } from "@rumbo/core";
import { CalendarIcon, FileTextIcon, FlagIcon, RepeatIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRIORITY_LABEL = { high: "Alta", medium: "Media", low: "Baja" } as const;

export function TaskRow({
  task,
  today,
  onToggle,
}: {
  task: Task;
  today: string;
  onToggle: (done: boolean) => void;
}) {
  const date = task.scheduled ?? task.due;
  const late = !task.done && date !== undefined && date < today;

  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <Checkbox
        className="mt-0.5"
        checked={task.done}
        onCheckedChange={(checked) => onToggle(checked === true)}
        aria-label={task.text}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn(task.done && "text-muted-foreground line-through")}>{task.text}</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {date && (
            <span className={cn("flex items-center gap-1", late && "text-destructive")}>
              <CalendarIcon className="size-3" />
              {task.due && !task.scheduled ? "vence " : ""}
              {formatShortDay(date)}
            </span>
          )}
          {task.recurrence && (
            <span className="flex items-center gap-1">
              <RepeatIcon className="size-3" />
              {task.recurrence}
            </span>
          )}
          {task.priority && (
            <span className="flex items-center gap-1">
              <FlagIcon className="size-3" />
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileTextIcon className="size-3" />
            {noteName(task.path)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1">
        {task.fields.area && <Badge variant="outline">{task.fields.area}</Badge>}
        {task.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            #{tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function noteName(path: string): string {
  return (path.split("/").pop() ?? path).replace(/\.md$/, "");
}
