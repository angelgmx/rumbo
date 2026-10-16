import { useEffect, useState } from "react";

export interface Stopwatch {
  /** Segundos desde el último `start`. */
  elapsedSeconds: number;
  running: boolean;
  start: () => void;
  /** Para y devuelve los segundos de la vuelta, para que quien lo usa los guarde. */
  stop: () => number;
}

/** Cronómetro hacia arriba. Como la cuenta atrás, calcula desde la hora de inicio. */
export function useStopwatch(): Stopwatch {
  const [startedAt, setStartedAt] = useState<number>();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === undefined) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return {
    elapsedSeconds: startedAt === undefined ? 0 : Math.floor((now - startedAt) / 1000),
    running: startedAt !== undefined,
    start() {
      setNow(Date.now());
      setStartedAt(Date.now());
    },
    stop() {
      setStartedAt(undefined);
      return startedAt === undefined ? 0 : Math.floor((Date.now() - startedAt) / 1000);
    },
  };
}
