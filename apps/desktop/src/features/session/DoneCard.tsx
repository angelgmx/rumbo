import { ArrowRightIcon, CheckIcon, XIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { IconAction } from "./IconAction";
import { nextRequest } from "./requests";
import type { SessionRequest } from "./types";
import type { ActiveSession, SessionActions } from "./useSessionEngine";

/** La sesión acabada: «Hecho» y lo que toca después, si hay un siguiente paso real. */
export function DoneCard({
  session,
  actions,
  onNext,
}: {
  session: ActiveSession;
  actions: SessionActions;
  onNext: (request: SessionRequest) => void;
}) {
  const rumbo = useRumbo();
  const next = nextRequest(rumbo, session.request);

  return (
    <>
      <div className="flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {session.request.title}
        </span>
        <IconAction label="Cerrar" onClick={actions.close} className="-my-1 -mr-1 size-6">
          <XIcon />
        </IconAction>
      </div>
      <p className="flex items-center gap-2 font-mono text-lg font-medium">
        <CheckIcon className="size-4 text-success" />
        Hecho
      </p>
      <div className="flex gap-2">
        {next && (
          <Button size="sm" title={next.title} onClick={() => onNext(next)}>
            Siguiente
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={actions.another}>
          Otros 5 min
        </Button>
      </div>
    </>
  );
}
