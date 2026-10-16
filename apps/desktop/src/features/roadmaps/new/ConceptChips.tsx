import { XIcon } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

/** Los conceptos de un módulo como fichas: Enter añade uno y la × lo quita. */
export function ConceptChips({
  concepts,
  onChange,
}: {
  concepts: string[];
  onChange: (concepts: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || !draft.trim()) return;
    event.preventDefault();
    onChange([...concepts, draft.trim()]);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {concepts.map((concept, index) => (
        <span
          key={`${concept}-${index}`}
          className="flex h-7 items-center gap-1 rounded-md border bg-muted/40 pr-1 pl-2.5 text-sm"
        >
          {concept}
          <button
            type="button"
            aria-label={`Quitar ${concept}`}
            onClick={() => onChange(concepts.filter((_, i) => i !== index))}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Añadir concepto y Enter"
        aria-label="Añadir concepto"
        className="h-7 min-w-40 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-faint"
      />
    </div>
  );
}
