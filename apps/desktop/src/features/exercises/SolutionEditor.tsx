import { ClipboardPasteIcon, PencilIcon, SaveIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock } from "./CodeBlock";

interface SolutionEditorProps {
  solution?: string;
  /** El nombre del fichero, para la barra y para el selector de subir. */
  fileName?: string;
  onSave: (code: string) => Promise<void>;
}

/** «Mi solución»: la pegas, la subes o la escribes, y se guarda en la nota del ejercicio. */
export function SolutionEditor({ solution, fileName, onSave }: SolutionEditorProps) {
  const [draft, setDraft] = useState<string>();
  const editing = draft !== undefined || !solution;

  async function save() {
    if (!draft?.trim()) return;
    await onSave(draft);
    setDraft(undefined);
    toast.success("Solución guardada en la nota");
  }

  if (!editing) {
    return (
      <CodeBlock
        code={solution}
        label={fileName ? `guardado · ${fileName}` : "guardado"}
        actions={
          <Button size="sm" variant="outline" onClick={() => setDraft(solution)}>
            <PencilIcon data-icon="inline-start" />
            Cambiar
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={draft ?? ""}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Pega aquí tu código cuando lo tengas."
        spellCheck={false}
        className="min-h-48 font-mono text-[13px]"
      />
      <div className="flex gap-2">
        <PasteButton onPaste={setDraft} />
        <UploadButton fileName={fileName} onLoad={setDraft} />
        <Button className="ml-auto" disabled={!draft?.trim()} onClick={save}>
          <SaveIcon data-icon="inline-start" />
          Guardar
        </Button>
      </div>
    </div>
  );
}

function PasteButton({ onPaste }: { onPaste: (code: string) => void }) {
  async function paste() {
    try {
      onPaste(await navigator.clipboard.readText());
    } catch {
      toast.error("No puedo leer el portapapeles. Pégalo con Ctrl V en el cuadro.");
    }
  }
  return (
    <Button variant="outline" onClick={paste}>
      <ClipboardPasteIcon data-icon="inline-start" />
      Pegar
    </Button>
  );
}

function UploadButton({ fileName, onLoad }: { fileName?: string; onLoad: (code: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const extension = fileName?.split(".").at(-1);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={extension ? `.${extension}` : undefined}
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) onLoad(await file.text());
          event.target.value = "";
        }}
      />
      <Button variant="outline" onClick={() => input.current?.click()}>
        <UploadIcon data-icon="inline-start" />
        Subir {extension ? `.${extension}` : "fichero"}
      </Button>
    </>
  );
}
