import { parseDuration } from "@rumbo/core";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatMinutes } from "@/lib/format";

/** Un campo donde se escribe la duración («45», «1h30», «1:30»…); se entiende al salir o con Enter. */
export function DurationInput({
  value,
  onCommit,
}: {
  value: number | undefined;
  onCommit: (minutes: number | undefined) => void;
}) {
  const [text, setText] = useState(value ? formatMinutes(value) : "");
  const [invalid, setInvalid] = useState(false);

  function commit() {
    if (!text.trim()) {
      setInvalid(false);
      if (value !== undefined) onCommit(undefined);
      return;
    }
    const minutes = parseDuration(text);
    setInvalid(minutes === undefined);
    if (minutes === undefined) return;
    setText(formatMinutes(minutes));
    if (minutes !== value) onCommit(minutes);
  }

  return (
    <div className="flex flex-col gap-1">
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && !event.ctrlKey && commit()}
        placeholder="45, 1h30, 1:30…"
        aria-label="Duración estimada"
        aria-invalid={invalid}
        className="w-36 font-mono"
      />
      {invalid && <p className="text-xs text-destructive">Prueba con 45, 1h30 o 1:30</p>}
    </div>
  );
}
