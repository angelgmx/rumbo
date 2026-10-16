import { useState } from "react";
import { cn } from "@/lib/utils";

interface InlineTitleProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  label: string;
}

/** Un texto que se edita en su sitio: clic para escribir, Intro o salir para guardar, Esc para dejarlo. */
export function InlineTitle({ value, onSave, className, label }: InlineTitleProps) {
  const [draft, setDraft] = useState<string | null>(null);

  function save() {
    const next = draft?.trim();
    setDraft(null);
    if (next && next !== value) onSave(next);
  }

  if (draft === null) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => setDraft(value)}
        className={cn("rounded-md text-left hover:bg-muted/60", className)}
      >
        {value}
      </button>
    );
  }

  return (
    <input
      autoFocus
      aria-label={label}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") save();
        if (event.key === "Escape") setDraft(null);
      }}
      className={cn("rounded-md bg-muted/60 outline-none ring-2 ring-ring/40", className)}
    />
  );
}
