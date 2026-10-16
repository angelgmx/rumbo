import { parseCapture, type Capture } from "@rumbo/core";
import { CalendarClockIcon, InboxIcon } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { formatDay } from "@/lib/format";

interface QuickCaptureApi {
  open: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureApi>({ open: () => {} });

export function useQuickCapture(): QuickCaptureApi {
  return useContext(QuickCaptureContext);
}

/** Captura rápida desde cualquier pantalla con Ctrl N. */
export function QuickCaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <QuickCaptureContext value={{ open: () => setOpen(true) }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Captura rápida</DialogTitle>
            <DialogDescription>
              Escríbelo como te salga: «gym mañana 18:00 1h30 #gym» va a la agenda; sin hora, al
              inbox.
            </DialogDescription>
          </DialogHeader>
          <CaptureForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </QuickCaptureContext>
  );
}

function CaptureForm({ onDone }: { onDone: () => void }) {
  const rumbo = useRumbo();
  const [text, setText] = useState("");
  const preview = text.trim() ? parseCapture(text, rumbo.daily.today()) : undefined;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;

    const result = await rumbo.tasks.capture(text);
    toast.success(
      result.kind === "agenda"
        ? `Añadido a la agenda del ${formatDay(result.date)}`
        : "Añadido al inbox",
    );
    setText("");
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Llamar al gestor mañana 10:00 #negocio"
        aria-label="Qué quieres apuntar"
      />
      <div className="flex min-h-5 items-center justify-between text-sm text-muted-foreground">
        {preview ? <CapturePreview capture={preview} /> : <span />}
        <span className="flex items-center gap-1">
          <Kbd>Enter</Kbd> guardar
        </span>
      </div>
    </form>
  );
}

function CapturePreview({ capture }: { capture: Capture }) {
  if (capture.date && capture.start) {
    const time = capture.end ? `${capture.start} – ${capture.end}` : capture.start;
    return (
      <span className="flex items-center gap-2">
        <CalendarClockIcon className="size-4 text-primary-text" />
        Agenda · {formatDay(capture.date)} · {time}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <InboxIcon className="size-4" />
      Inbox{capture.date ? ` · para el ${formatDay(capture.date)}` : ""}
    </span>
  );
}
