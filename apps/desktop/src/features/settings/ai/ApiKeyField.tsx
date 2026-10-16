import { KeyRoundIcon, LockIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Lo justo para reconocer la clave sin enseñarla.
const VISIBLE_END = 4;

/** La clave de API: se ve tapada y se cambia en el llavero del sistema. */
export function ApiKeyField({
  value,
  onSave,
}: {
  value: string;
  onSave: (key: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(value === "");
  const [draft, setDraft] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave(draft.trim());
    setDraft("");
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {editing ? (
        <form onSubmit={submit} className="flex gap-3">
          <Input
            type="password"
            autoFocus={value !== ""}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Pega aquí tu clave"
            aria-label="Clave de API"
            className="font-mono"
          />
          <Button type="submit" variant="outline" disabled={!draft.trim()}>
            Guardar
          </Button>
        </form>
      ) : (
        <div className="flex gap-3">
          <Input readOnly value={masked(value)} aria-label="Clave de API" className="font-mono" />
          <Button variant="outline" onClick={() => setEditing(true)}>
            <KeyRoundIcon data-icon="inline-start" />
            Cambiar
          </Button>
        </div>
      )}
      <p className="flex items-center gap-2 text-sm text-success">
        <LockIcon className="size-3.5" />
        {value
          ? "Guardada en el llavero del sistema. Nunca se escribe en el vault."
          : "Se guarda en el llavero del sistema. Nunca se escribe en el vault."}
      </p>
    </div>
  );
}

function masked(key: string): string {
  return `${"•".repeat(24)}${key.slice(-VISIBLE_END)}`;
}
