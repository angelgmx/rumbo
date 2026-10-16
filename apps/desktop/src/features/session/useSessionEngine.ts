import { useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { useCountdown } from "@/hooks/useCountdown";
import { loadSession, saveSession } from "./storage";
import type { SessionRequest, SessionState } from "./types";

/** Menos de esto no se apunta: un clic sin querer no suma un minuto. */
const MIN_CREDIT_SECONDS = 30;
const EXTRA_MINUTES = 5;

export interface ActiveSession extends SessionState {
  running: boolean;
  secondsLeft: number;
}

export interface SessionActions {
  start: (request: SessionRequest) => void;
  toggle: () => void;
  restart: () => void;
  extend: () => void;
  togglePomodoro: () => void;
  another: () => void;
  close: () => void;
}

/**
 * La sesión de trabajo: cuenta atrás, tiempo trabajado y su copia en localStorage.
 * Lo trabajado se apunta en la tarea solo al terminar o cerrar, nunca cada segundo.
 * En modo pomodoro cada ronda de trabajo va seguida de su descanso, que no se apunta.
 */
export function useSessionEngine(): { session?: ActiveSession; actions: SessionActions } {
  const rumbo = useRumbo();
  const [restored] = useState(restore);
  const [state, setState] = useState(restored?.state);
  const { work, rest } = rumbo.store.config.pomodoro;

  function record(request: SessionRequest, seconds: number) {
    const minutes = seconds >= MIN_CREDIT_SECONDS ? seconds / 60 : 0;
    // Las sesiones guardadas antes de la base de datos señalaban la tarea por su línea: no hay id.
    if (typeof request.task?.id !== "number" || minutes === 0) return;
    rumbo.tasks
      .recordSession(request.task.id, minutes)
      .catch(() => toast.error("No se ha podido apuntar el tiempo en la tarea"));
  }

  /** Termina la ronda; si es de trabajo en pomodoro, devuelve los minutos del descanso que sigue. */
  function finish(): number | undefined {
    if (!state) return undefined;
    if (state.resting) {
      setState({ ...state, banked: 0, length: 0, resting: false, finished: true });
      return undefined;
    }
    record(state.request, state.banked + state.length);
    if (!state.pomodoro) {
      setState({ ...state, banked: 0, length: 0, finished: true });
      return undefined;
    }
    setState({ ...state, banked: 0, length: rest * 60, resting: true, rounds: state.rounds + 1 });
    return rest;
  }

  const countdown = useCountdown((restored?.secondsLeft ?? 0) / 60, finish);

  const { running, secondsLeft } = countdown;
  useEffect(
    () =>
      saveSession(
        state && {
          state,
          secondsLeft,
          endsAt: running ? Date.now() + secondsLeft * 1000 : undefined,
        },
      ),
    [state, running, secondsLeft],
  );

  const resumed = useRef(false);
  const resume = useEffectEvent(() => {
    if (resumed.current || !restored) return;
    resumed.current = true;
    if (restored.owed) record(restored.state.request, restored.owed);
    else if (restored.running) countdown.start(restored.secondsLeft / 60);
  });
  useEffect(() => resume(), []);

  const workedSeconds = (current: SessionState) =>
    current.resting ? 0 : current.banked + current.length - countdown.secondsLeft;

  /** Apunta lo trabajado si la sesión sigue abierta; una terminada ya se apuntó. */
  function settle(current: SessionState | undefined) {
    if (current && !current.finished) record(current.request, workedSeconds(current));
  }

  const actions: SessionActions = {
    start(request) {
      settle(state);
      setState({
        request,
        length: request.minutes * 60,
        banked: 0,
        finished: false,
        pomodoro: false,
        resting: false,
        rounds: 0,
      });
      countdown.start(request.minutes);
    },
    toggle: countdown.toggle,
    restart() {
      if (!state) return;
      const minutes = roundMinutes(state);
      setState({ ...state, banked: workedSeconds(state), length: minutes * 60 });
      countdown.start(minutes);
    },
    extend() {
      if (!state) return;
      setState({ ...state, length: state.length + EXTRA_MINUTES * 60 });
      countdown.extend(EXTRA_MINUTES);
    },
    togglePomodoro() {
      if (!state) return;
      if (state.pomodoro || state.resting) {
        setState({ ...state, pomodoro: !state.pomodoro });
        return;
      }
      setState({ ...state, pomodoro: true, banked: workedSeconds(state), length: work * 60 });
      countdown.start(work);
    },
    another() {
      if (!state) return;
      const minutes = state.pomodoro ? work : EXTRA_MINUTES;
      setState({ ...state, length: minutes * 60, finished: false });
      countdown.start(minutes);
    },
    close() {
      settle(state);
      countdown.reset(0);
      setState(undefined);
    },
  };

  function roundMinutes(current: SessionState): number {
    if (current.resting) return rest;
    return current.pomodoro ? work : current.request.minutes;
  }

  const session = state && {
    ...state,
    running: countdown.running,
    secondsLeft: countdown.secondsLeft,
  };
  return { session, actions };
}

/**
 * La sesión guardada, con lo que queda según la hora a la que terminaba. Si terminó con la
 * app cerrada vuelve como terminada y con lo que quedó sin apuntar en `owed`.
 */
function restore() {
  const stored = loadSession();
  if (!stored) return undefined;
  const { state, endsAt } = stored;
  const secondsLeft =
    endsAt === undefined
      ? stored.secondsLeft
      : Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  const expired = endsAt !== undefined && secondsLeft === 0 && !state.finished;
  return {
    state: expired ? { ...state, banked: 0, length: 0, resting: false, finished: true } : state,
    secondsLeft,
    running: endsAt !== undefined && secondsLeft > 0,
    owed: expired && !state.resting ? state.banked + state.length : 0,
  };
}
