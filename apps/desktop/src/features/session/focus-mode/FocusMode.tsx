import { CheckIcon, PauseIcon, PlayIcon, PlusIcon } from "lucide-react";
import { useEffect, useEffectEvent } from "react";
import { createPortal } from "react-dom";
import { useRumbo } from "@/app/RumboContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { formatClock } from "@/hooks/useCountdown";
import type { ActiveSession, SessionActions } from "../useSessionEngine";
import { FocusModeFooter } from "./FocusModeFooter";
import { FocusModeHeading } from "./FocusModeHeading";
import { RoundsBar } from "./RoundsBar";
import { TimerRing } from "./TimerRing";
import { useFocusModeDetails } from "./useFocusModeDetails";

/** La sesión a pantalla completa: solo lo que haces, el reloj y lo justo para seguir. */
export function FocusMode({
  session,
  actions,
  onExit,
}: {
  session: ActiveSession;
  actions: SessionActions;
  onExit: () => void;
}) {
  const { cycles, rest } = useRumbo().store.config.pomodoro;
  const { task, next } = useFocusModeDetails(session.request);
  const remaining = session.length > 0 ? session.secondsLeft / session.length : 0;

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") onExit();
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label="Modo enfoque"
      className="fixed inset-0 z-70 flex flex-col bg-background bg-[radial-gradient(circle_at_center,var(--primary-soft),transparent_60%)] p-8"
    >
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-3 text-sm text-muted-foreground">
          <Logo />
          Modo enfoque
        </span>
        <Button variant="outline" onClick={onExit}>
          Salir
          <Kbd>Esc</Kbd>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8">
        <FocusModeHeading title={session.request.title} task={task} />
        <TimerRing remaining={session.finished ? 0 : remaining}>
          <span className="text-8xl font-semibold tracking-tighter tabular-nums">
            {formatClock(session.secondsLeft)}
          </span>
          <span className="text-sm text-muted-foreground">{roundLabel(session, cycles)}</span>
        </TimerRing>
        {session.pomodoro && (
          <div className="flex flex-col items-center gap-3">
            <RoundsBar
              rounds={session.rounds}
              total={cycles}
              current={session.resting || session.finished ? undefined : 1 - remaining}
            />
            {!session.resting && !session.finished && (
              <p className="text-sm text-muted-foreground">Después: descanso de {rest} min</p>
            )}
          </div>
        )}
        <div className="flex items-center gap-4">
          {session.finished ? (
            <Button size="lg" className="h-12 px-8" onClick={actions.another}>
              <PlayIcon data-icon="inline-start" />
              Otra ronda
            </Button>
          ) : (
            <>
              <Button variant="outline" size="lg" className="h-12 px-6" onClick={actions.extend}>
                <PlusIcon data-icon="inline-start" />5 min
              </Button>
              <Button size="lg" className="h-12 px-8" onClick={actions.toggle}>
                {session.running ? (
                  <PauseIcon data-icon="inline-start" />
                ) : (
                  <PlayIcon data-icon="inline-start" />
                )}
                {session.running ? "Pausa" : "Seguir"}
              </Button>
            </>
          )}
          <Button variant="outline" size="lg" className="h-12 px-6" onClick={actions.close}>
            <CheckIcon data-icon="inline-start" />
            Terminar
          </Button>
        </div>
      </main>

      <FocusModeFooter task={task} next={next} />
    </div>,
    document.body,
  );
}

function roundLabel(session: ActiveSession, cycles: number): string {
  if (session.finished) return "Sesión terminada";
  if (session.resting) return "Descanso";
  if (!session.pomodoro) return session.running ? "En marcha" : "En pausa";
  return `Pomodoro · ciclo ${session.rounds + 1} de ${Math.max(cycles, session.rounds + 1)}`;
}
