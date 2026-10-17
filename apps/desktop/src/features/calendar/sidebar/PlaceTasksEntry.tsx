import { sourceTasks, type IsoDate } from "@rumbo/core";
import { ListTodoIcon } from "lucide-react";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { NavRow } from "./NavRow";

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
  const count = useVaultQuery(
    (r) =>
      sourceTasks(r.tasks.all(), { kind: "undated" }, { from: today, to: today }, today).undated
        .length,
  ).data;

  return (
    <NavRow
      icon={<ListTodoIcon />}
      label="Tareas para colocar"
      count={count ?? 0}
      active={active}
      onClick={onToggle}
    />
  );
}
