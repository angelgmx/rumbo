import { createContext, useContext, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const WIKILINK_SCHEME = "nota:";

interface MarkdownProps {
  /** El cuerpo de la nota, sin frontmatter. */
  source: string;
  /** Qué hacer al pulsar un [[enlace]] a otra nota. */
  onOpenNote?: (name: string) => void;
  className?: string;
}

/** Pinta una nota de Obsidian: callouts, wikilinks, tablas, código y casillas. */
export function Markdown({ source, onOpenNote, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none",
        className,
      )}
    >
      <OpenNoteContext value={onOpenNote}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // Sin esto react-markdown borra los enlaces con un esquema que no conoce, como "nota:".
          urlTransform={(url) => url}
          components={{ a: MarkdownLink }}
        >
          {toStandardMarkdown(source)}
        </ReactMarkdown>
      </OpenNoteContext>
    </div>
  );
}

// El enlace se define fuera de Markdown (no en cada render) y recibe la acción por contexto.
const OpenNoteContext = createContext<((name: string) => void) | undefined>(undefined);

function MarkdownLink({ href, children }: { href?: string; children?: ReactNode }) {
  const onOpenNote = useContext(OpenNoteContext);
  if (!href?.startsWith(WIKILINK_SCHEME)) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="font-medium text-primary-text underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
      onClick={() => onOpenNote?.(decodeURIComponent(href.slice(WIKILINK_SCHEME.length)))}
    >
      {children}
    </button>
  );
}

/** Convierte lo propio de Obsidian en Markdown normal que entiende react-markdown. */
function toStandardMarkdown(source: string): string {
  return (
    source
      // La primera línea de etiquetas (#java #bucles) no aporta al leer.
      .replace(/^\s*(#[\p{L}\p{N}_/-]+\s*)+\n/u, "")
      // > [!check] Criterio de dominado  →  > **Criterio de dominado**
      .replace(
        /^>\s*\[!(\w+)\][+-]?\s*(.*)$/gm,
        (_, type: string, title: string) => `> **${title || capitalize(type)}**`,
      )
      // [[Nota|texto]] y [[Nota]]  →  enlaces que abren la nota dentro de la app
      .replace(
        /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g,
        (_, name: string, label?: string) =>
          `[${label ?? name}](${WIKILINK_SCHEME}${encodeURIComponent(name.trim())})`,
      )
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
