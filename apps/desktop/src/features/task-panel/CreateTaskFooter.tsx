import { PanelFooter } from "@/components/panel/PanelFooter";
import { Switch } from "@/components/ui/switch";

/** Pie del modo crear: «Crear otra», el atajo y el botón que guarda la tarea. */
export function CreateTaskFooter({
  another,
  canCreate,
  onAnotherChange,
  onCreate,
}: {
  another: boolean;
  canCreate: boolean;
  onAnotherChange: (another: boolean) => void;
  onCreate: () => void;
}) {
  return (
    <PanelFooter label="Crear tarea" disabled={!canCreate} onSubmit={onCreate}>
      <label className="flex items-center gap-3 text-sm">
        <Switch checked={another} onCheckedChange={onAnotherChange} />
        Crear otra
      </label>
    </PanelFooter>
  );
}
