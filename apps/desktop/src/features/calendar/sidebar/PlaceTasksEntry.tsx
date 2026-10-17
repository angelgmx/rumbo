import { sourceCount, sourceTasks, type IsoDate } from "@rumbo/core";
import { ChevronRightIcon, ListTodoIcon } from "lucide-react";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { cn } from "@/lib/utils";

/** La entrada de las tareas por colocar, con cuántas hay; pulsarla abre o cierra su panel. */
export function PlaceTasksEntry({
  today,
  active,
  onToggle,
}: {
  today: IsoDate;
  active: boolean;
  onToggle: () => void;
}) {
  const count = useVaultQuery((r) =>
    sourceCount(sourceTasks(r.tasks.all(), { kind: "undated" }, { from: today, to: today }, today)),
  ).data;

  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={onToggle}
      className={cn(
        "flex h-[38px] items-center gap-2.5 rounded-lg border border-transparent px-2.5 text-[14px] transition-colors duration-(--dur-fast) hover:bg-muted/60",
        active && "border-border bg-card shadow-card hover:bg-card",
      )}
    >
      <ListTodoIcon className="size-4 text-muted-foreground" />
      <span className="font-medium">Tareas para colocar</span>
      <span className="ml-auto font-mono text-[13px] text-muted-foreground">{count}</span>
      <ChevronRightIcon
        className={cn("size-3.5 shrink-0 text-faint", active && "text-foreground")}
      />
    </button>
  );
}
