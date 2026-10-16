import { LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

/** «Pide un cambio»: la IA rehace la ruta con lo que digas, sin empezar de cero. */
export function ChangeRequest({
  thinking,
  onRequest,
}: {
  thinking: boolean;
  onRequest: (change: string) => Promise<void>;
}) {
  const [change, setChange] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!change.trim() || thinking) return;
    await onRequest(change);
    setChange("");
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3"
    >
      {thinking ? (
        <LoaderCircleIcon className="size-4 animate-spin text-primary-text" />
      ) : (
        <SparklesIcon className="size-4 text-primary-text" />
      )}
      <input
        value={change}
        onChange={(event) => setChange(event.target.value)}
        disabled={thinking}
        placeholder="Pide un cambio: «más práctica», «quita el último», «en inglés»…"
        aria-label="Pide un cambio a la IA"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}
