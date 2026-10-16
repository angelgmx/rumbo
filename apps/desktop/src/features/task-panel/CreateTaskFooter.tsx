import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
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
    <footer className="flex items-center gap-3 border-t px-6 py-4">
      <label className="flex items-center gap-3 text-sm">
        <Switch checked={another} onCheckedChange={onAnotherChange} />
        Crear otra
      </label>
      <Kbd className="ml-auto">Ctrl Enter</Kbd>
      <Button type="button" disabled={!canCreate} onClick={onCreate}>
        Crear tarea
      </Button>
    </footer>
  );
}
