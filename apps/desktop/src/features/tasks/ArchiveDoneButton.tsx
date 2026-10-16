import { ArchiveIcon } from "lucide-react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";

/** Manda al archivo las hechas del inbox; las de dailies y proyectos no se mueven. */
export function ArchiveDoneButton({ count }: { count: number }) {
  const rumbo = useRumbo();

  async function archive() {
    try {
      const moved = await rumbo.tasks.archiveDone();
      toast.success(moved === 1 ? "1 tarea archivada" : `${moved} tareas archivadas`);
    } catch {
      toast.error("No se han podido archivar las tareas");
    }
  }

  return (
    <Button variant="outline" disabled={count === 0} onClick={() => void archive()}>
      <ArchiveIcon data-icon="inline-start" />
      Archivar hechas del inbox
    </Button>
  );
}
