import type { NoteFolder, TopicSummary } from "@rumbo/core";
import { ChevronDownIcon, CodeIcon, FileIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo, useVaultVersion } from "@/app/RumboContext";
import { Markdown } from "@/components/Markdown";
import { Card } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { ObsidianButton } from "./ObsidianButton";
import { folderLabel } from "./topic";

/** Pestaña Apuntes: el árbol de carpetas a la izquierda y la nota abierta a la derecha. */
export function TopicNotes({ topic }: { topic: TopicSummary }) {
  const [selected, setSelected] = useState(() => firstNote(topic));
  const [query, setQuery] = useState("");

  return (
    <div className="grid h-[calc(100svh-15rem)] min-h-[520px] grid-cols-[360px_1fr] gap-4">
      <Card className="gap-2 overflow-y-auto px-2 pt-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar en tus apuntes de ${topic.title}…`}
          />
        </InputGroup>
        {topic.notes.map((folder) => (
          <FolderTree
            key={folder.name}
            folder={folder}
            query={query.trim().toLowerCase()}
            selected={selected}
            onSelect={setSelected}
          />
        ))}
      </Card>
      <NoteView topic={topic} path={selected} onOpenNote={setSelected} />
    </div>
  );
}

/** Abre de entrada un apunte del módulo que estás estudiando. */
function firstNote(topic: TopicSummary): string | undefined {
  const current = topic.roadmap?.current;
  const ofCurrent = current?.notes.find((note) =>
    topic.notes.some((folder) => folder.notes.some((other) => other.path === note.path)),
  );
  return ofCurrent?.path ?? topic.notes[0]?.notes[0]?.path;
}

interface FolderTreeProps {
  folder: NoteFolder;
  query: string;
  selected?: string;
  onSelect: (path: string) => void;
}

function FolderTree({ folder, query, selected, onSelect }: FolderTreeProps) {
  const [open, setOpen] = useState(() => folder.notes.some((note) => note.path === selected));
  const notes = query
    ? folder.notes.filter((note) => note.name.toLowerCase().includes(query))
    : folder.notes;
  if (query && notes.length === 0) return null;
  // Al buscar se abren las carpetas que tienen resultados.
  const expanded = open || Boolean(query);

  const list = notes.map((note) => {
    const Icon = /^(Código|Code)\b/.test(note.name) ? CodeIcon : FileIcon;
    const active = note.path === selected;
    return (
      <button
        key={note.path}
        type="button"
        onClick={() => onSelect(note.path)}
        className={cn(
          "flex items-center gap-2.5 rounded-md py-1.5 pr-2 pl-8 text-left text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted/60 hover:text-foreground",
          active && "bg-muted text-foreground",
        )}
      >
        <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
        <span className="truncate">{note.name}</span>
      </button>
    );
  });

  // Notas sueltas en Apuntes/, sin carpeta: van sin cabecera.
  if (!folder.name) return <div className="flex flex-col">{list}</div>;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60"
      >
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-(--dur-fast)",
            !expanded && "-rotate-90",
          )}
        />
        <span className="flex-1 truncate">{folderLabel(folder.name)}</span>
        <span className="font-mono text-xs text-muted-foreground">{folder.notes.length}</span>
      </button>
      {expanded && list}
    </div>
  );
}

interface NoteViewProps {
  topic: TopicSummary;
  path?: string;
  onOpenNote: (path: string) => void;
}

function NoteView({ topic, path, onOpenNote }: NoteViewProps) {
  const { store } = useRumbo();
  // Si editas la nota en Obsidian mientras la lees, se ve el cambio.
  useVaultVersion();
  const note = path ? store.get(path) : undefined;

  if (!note) {
    return (
      <Card className="items-center justify-center text-muted-foreground">
        Elige un apunte de la izquierda.
      </Card>
    );
  }

  const topicFolder = topic.path.split("/").slice(0, -1).join("/");
  const hasTitle = /^\s*#\s/.test(note.body);

  return (
    <Card className="gap-4 overflow-y-auto px-7 pt-6">
      <div className="flex items-start justify-between gap-4">
        <span className="truncate pt-2 font-mono text-xs text-muted-foreground">
          {note.path.slice(topicFolder.length + 1)}
        </span>
        <ObsidianButton path={note.path} />
      </div>
      {!hasTitle && <h2 className="text-3xl font-semibold tracking-tight">{note.name}</h2>}
      <Markdown
        source={note.body}
        className="max-w-3xl"
        onOpenNote={(name) => {
          const linked = store.findByName(name);
          if (linked) onOpenNote(linked.path);
        }}
      />
    </Card>
  );
}
