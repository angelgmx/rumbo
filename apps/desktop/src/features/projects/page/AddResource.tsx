import { type ProjectLink, parseProjectLink } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { Input } from "@/components/ui/input";

/** «+ Añadir»: pega la dirección de un repositorio o una web, o elige una nota del vault. */
export function AddResource({ id, links }: { id: number; links: ProjectLink[] }) {
  const { projects, store } = useRumbo();
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);
  const linked = new Set(links.flatMap((link) => (link.kind === "note" ? [link.name] : [])));
  const notes = store
    .allNotes()
    .filter(
      (note) =>
        (note.data.type === undefined || note.data.type === "note") && !linked.has(note.name),
    )
    .map(({ name }) => ({ value: name, label: name }));

  return (
    <PropertyPopover
      label="Añadir un enlace o una nota"
      width="w-80"
      className="h-7 rounded-md px-2 text-primary-text"
      trigger={
        <>
          <PlusIcon className="size-4" />
          Añadir
        </>
      }
    >
      {(close) => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 px-1 pt-1">
            <Input
              autoFocus
              aria-label="Dirección del enlace"
              placeholder="github.com/usuario/repositorio"
              value={text}
              aria-invalid={invalid}
              onChange={(event) => {
                setText(event.target.value);
                setInvalid(false);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const link = parseProjectLink(text);
                if (!link) return setInvalid(true);
                void projects.addLink(id, link);
                setText("");
                close();
              }}
            />
            {invalid && (
              <span className="text-xs text-destructive">
                Escribe una dirección, como citalash.app
              </span>
            )}
          </div>
          {notes.length > 0 && (
            <>
              <span className="px-2 text-xs text-muted-foreground">o una nota del vault</span>
              <OptionList
                options={notes}
                value={undefined}
                onChoose={(name) => {
                  if (name) void projects.addLink(id, { kind: "note", name });
                  close();
                }}
              />
            </>
          )}
        </div>
      )}
    </PropertyPopover>
  );
}
