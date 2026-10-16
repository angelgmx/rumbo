import { XIcon } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { PropertyRow } from "./PropertyRow";

/** Las etiquetas de la tarea: escribe una y Enter, o elige entre las que ya usas. */
export function TagsProperty({
  tags,
  known,
  onChange,
}: {
  tags: string[];
  /** Todas las etiquetas del vault, para sugerir. */
  known: string[];
  onChange: (tags: string[]) => void;
}) {
  const [text, setText] = useState("");
  const suggestions = known.filter((tag) => !tags.includes(tag));

  function add(raw: string) {
    const tag = raw.trim().replace(/^#/, "").replace(/\s+/g, "-");
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setText("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    add(text);
  }

  return (
    <PropertyRow
      label="Etiquetas"
      value={tags.length > 0 ? <TagList tags={tags} /> : undefined}
      width="w-64 gap-2 p-2.5"
    >
      {() => (
        <>
          <input
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Nueva etiqueta y Enter"
            aria-label="Nueva etiqueta"
            className="h-8 rounded-md border bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-label={`Quitar #${tag}`}
                  onClick={() => onChange(tags.filter((other) => other !== tag))}
                >
                  #{tag}
                  <XIcon data-icon="inline-end" />
                </Button>
              ))}
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {suggestions.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => add(tag)}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </PropertyRow>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs">
          #{tag}
        </span>
      ))}
    </span>
  );
}
