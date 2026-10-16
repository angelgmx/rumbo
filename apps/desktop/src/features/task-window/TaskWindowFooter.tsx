import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Switch } from "@/components/ui/switch";

/** Pie de la ventana: «Crear otra» (solo al crear), el atajo y el botón de guardar. */
export function TaskWindowFooter({
  editing,
  another,
  canSave,
  onAnotherChange,
  onSave,
}: {
  editing: boolean;
  another: boolean;
  canSave: boolean;
  onAnotherChange: (another: boolean) => void;
  onSave: () => void;
}) {
  return (
    <footer className="flex items-center gap-3 border-t px-6 py-4">
      {!editing && (
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={another} onCheckedChange={onAnotherChange} />
          Crear otra
        </label>
      )}
      <Kbd className="ml-auto">Ctrl Enter</Kbd>
      <Button type="button" disabled={!canSave} onClick={onSave}>
        {editing ? "Guardar" : "Crear tarea"}
      </Button>
    </footer>
  );
}
