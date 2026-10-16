import {
  EyeOffIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  SquareIcon,
  TimerIcon,
} from "lucide-react";
import { formatClock } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";
import { IconAction } from "./IconAction";
import type { ActiveSession, SessionActions } from "./useSessionEngine";

/** La sesión en marcha: lo que haces, el tiempo que queda y los controles. */
export function TimerCard({
  session,
  actions,
  onHide,
}: {
  session: ActiveSession;
  actions: SessionActions;
  onHide: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {session.resting ? "Descanso" : session.request.title}
        </span>
        <IconAction
          label="Pomodoro"
          aria-pressed={session.pomodoro}
          onClick={actions.togglePomodoro}
          className={cn("-my-1 size-6", session.pomodoro ? "text-primary-text" : "text-faint")}
        >
          <TimerIcon />
        </IconAction>
        <IconAction label="Ocultar" onClick={onHide} className="-my-1 -mr-1 size-6">
          <EyeOffIcon />
        </IconAction>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-3xl font-medium tracking-tight tabular-nums">
          {formatClock(session.secondsLeft)}
        </span>
        <div className="flex">
          <IconAction label={session.running ? "Pausar" : "Seguir"} onClick={actions.toggle}>
            {session.running ? <PauseIcon /> : <PlayIcon />}
          </IconAction>
          <IconAction label="Reiniciar" onClick={actions.restart}>
            <RotateCcwIcon />
          </IconAction>
          <IconAction label="Cinco minutos más" onClick={actions.extend}>
            <PlusIcon />
          </IconAction>
          <IconAction label="Terminar" onClick={actions.close}>
            <SquareIcon />
          </IconAction>
        </div>
      </div>
    </>
  );
}
