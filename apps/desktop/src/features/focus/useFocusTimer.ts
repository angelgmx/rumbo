import { useState } from "react";
import { formatClock, useCountdown } from "@/hooks/useCountdown";

export type TimerState = "idle" | "running" | "paused";

/** El temporizador de Foco: nace parado y distingue «sin empezar» de «en pausa». */
export function useFocusTimer(onFinish: () => void) {
  const [started, setStarted] = useState(false);
  const countdown = useCountdown(0, () => {
    setStarted(false);
    onFinish();
  });
  const state: TimerState = countdown.running ? "running" : started ? "paused" : "idle";

  return {
    state,
    clock: formatClock(countdown.secondsLeft),
    toggle: countdown.toggle,
    start(minutes: number) {
      setStarted(true);
      countdown.start(minutes);
    },
  };
}

export type FocusTimer = ReturnType<typeof useFocusTimer>;
