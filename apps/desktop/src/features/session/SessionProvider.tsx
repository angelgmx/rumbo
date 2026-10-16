import { createContext, useContext, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { NoteReader } from "@/features/roadmaps/NoteReader";
import { FloatingTimer } from "./FloatingTimer";
import { placeHref } from "./places";
import type { SessionRequest } from "./types";
import { useSessionEngine } from "./useSessionEngine";

interface SessionApi {
  /** Hay una sesión abierta, en marcha, en pausa o terminada. */
  active: boolean;
  /** Empieza la sesión y lleva a donde se trabaja; si había otra, la cierra apuntando lo hecho. */
  start: (request: SessionRequest) => void;
}

const SessionContext = createContext<SessionApi>({ active: false, start: () => {} });

export function useSession(): SessionApi {
  return useContext(SessionContext);
}

/** La sesión de trabajo de toda la app: el reloj vive aquí, no en la página que la empezó. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const { session, actions } = useSessionEngine();
  const [, navigate] = useLocation();
  const [reading, setReading] = useState<string>();

  function start(request: SessionRequest) {
    actions.start(request);
    setReading(request.place?.note);
    if (request.place) navigate(placeHref(request.place));
  }

  return (
    <SessionContext value={{ active: session !== undefined, start }}>
      {children}
      {session && <FloatingTimer session={session} actions={actions} onNext={start} />}
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </SessionContext>
  );
}
