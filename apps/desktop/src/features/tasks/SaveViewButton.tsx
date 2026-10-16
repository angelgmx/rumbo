import type { SavedView } from "@rumbo/core";
import { FilterIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Guarda la vista actual con sus filtros para volver a ella desde la barra lateral.
 * Sin filtros no hay nada que guardar: la vista ya está en la barra.
 */
export function SaveViewButton({ view }: { view: Omit<SavedView, "name"> }) {
  const hasFilters = Boolean(view.area || view.project || view.tag);
  const rumbo = useRumbo();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await rumbo.views.save({ ...view, name: name.trim() });
    toast.success(`Vista «${name.trim()}» guardada`);
    setName("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" disabled={!hasFilters} />}>
        <FilterIcon data-icon="inline-start" />
        Guardar vista
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <form onSubmit={save} className="flex flex-col gap-3">
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre de la vista"
            aria-label="Nombre de la vista"
          />
          <Button type="submit" size="sm" disabled={!name.trim()}>
            Guardar
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
