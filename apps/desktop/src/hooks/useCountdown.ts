import { useEffect, useEffectEvent, useState } from "react";

export interface Countdown {
  secondsLeft: number;
  running: boolean;
  start: (minutes: number) => void;
  toggle: () => void;
}

/**
 * Cuenta atrás que solo vive en pantalla. Guarda la hora a la que termina en vez
 * de restar segundos, así no se desfasa aunque la ventana se congele un rato.
 */
export function useCountdown(initialMinutes: number, onFinish: () => void): Countdown {
  const [pausedSeconds, setPausedSeconds] = useState(initialMinutes * 60);
  const [endsAt, setEndsAt] = useState<number>();
  const [now, setNow] = useState(() => Date.now());
  // Siempre la última versión del aviso, sin reiniciar el intervalo cuando cambia.
  const finish = useEffectEvent(onFinish);

  useEffect(() => {
    if (endsAt === undefined) return;
    const timer = setInterval(() => {
      if (Date.now() < endsAt) {
        setNow(Date.now());
        return;
      }
      setEndsAt(undefined);
      setPausedSeconds(0);
      finish();
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const secondsLeft =
    endsAt === undefined ? pausedSeconds : Math.max(0, Math.ceil((endsAt - now) / 1000));

  return {
    secondsLeft,
    running: endsAt !== undefined,
    start(minutes) {
      setNow(Date.now());
      setEndsAt(Date.now() + minutes * 60_000);
    },
    toggle() {
      if (endsAt === undefined) {
        setNow(Date.now());
        setEndsAt(Date.now() + secondsLeft * 1000);
      } else {
        setPausedSeconds(secondsLeft);
        setEndsAt(undefined);
      }
    },
  };
}

/** "50:00" */
export function formatClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
