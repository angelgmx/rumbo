import { useState, type FormEvent } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** El formulario de un resultado clave nuevo: no se guarda hasta tener nombre y una meta distinta del inicio. */
export function NewKeyResult({ goalId, onDone }: { goalId: number; onDone: () => void }) {
  const { goals } = useRumbo();
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("0");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const complete = title.trim() !== "" && from !== "" && target !== "" && from !== target;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!complete) return;
    await goals.addKeyResult(goalId, {
      title: title.trim(),
      from: Number(from),
      target: Number(target),
      unit: unit.trim() || undefined,
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border bg-card px-4 py-3">
      <Input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Sesiones de conversación"
        aria-label="Nombre del resultado clave"
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        Desde
        <Input
          type="number"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          aria-label="Desde"
          className="w-20 font-mono"
        />
        hasta
        <Input
          type="number"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          aria-label="Hasta"
          className="w-20 font-mono"
        />
        <Input
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          placeholder="unidad"
          aria-label="Unidad"
          className="w-24"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={!complete}>
          Añadir
        </Button>
      </div>
    </form>
  );
}
