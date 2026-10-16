import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface FocusTimer {
  secondsLeft: number;
  running: boolean;
  start: (minutes: number) => void;
  toggle: () => void;
}

const DEFAULT_MINUTES = 50;

/**
 * Temporizador de foco. Solo vive en la pantalla: no se guarda nada en el vault.
 * Guarda la hora a la que termina en vez de restar segundos, así no se desfasa.
 */
export function useFocusTimer(): FocusTimer {
  const [pausedSeconds, setPausedSeconds] = useState(DEFAULT_MINUTES * 60);
  const [endsAt, setEndsAt] = useState<number>();
  // La hora de la última vuelta del intervalo; con ella se calcula lo que queda.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === undefined) return;
    const timer = setInterval(() => {
      if (Date.now() < endsAt) {
        setNow(Date.now());
        return;
      }
      setEndsAt(undefined);
      setPausedSeconds(0);
      toast.success("Bloque de foco terminado. Descansa un poco.");
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
export function formatCountdown(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
