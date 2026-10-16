import { setCounterMinutes } from "@rumbo/core";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useEffectEvent } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatClock } from "@/hooks/useCountdown";
import { useStopwatch } from "@/hooks/useStopwatch";
import type { CountedTask } from "./countedTask";

/**
 * Cronómetro hacia arriba. Al vault solo va al pausar o al salir de la pantalla:
 * escribir cada segundo llenaría Obsidian de cambios. Con `autoStart` arranca al montarse.
 */
export function MinutesCounter({ task, autoStart }: { task: CountedTask; autoStart?: boolean }) {
  const rumbo = useRumbo();
  const stopwatch = useStopwatch();
  const { counter } = task;

  const save = (seconds: number) => {
    if (seconds < 30) return;
    void rumbo.tasks.setCounter(task, setCounterMinutes(counter, counter.current + seconds / 60));
  };

  // Si cierras la tarea con el cronómetro en marcha, lo hecho hasta ahí se guarda.
  const saveOnLeave = useEffectEvent(() => {
    if (stopwatch.running) save(stopwatch.stop());
  });
  useEffect(() => () => saveOnLeave(), []);

  const begin = useEffectEvent(() => stopwatch.start());
  useEffect(() => {
    if (autoStart) begin();
  }, [autoStart]);

  const seconds = counter.current * 60 + stopwatch.elapsedSeconds;
  const toggle = () => (stopwatch.running ? save(stopwatch.stop()) : stopwatch.start());

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
        {formatClock(seconds)}
      </span>
      <span className="text-sm text-muted-foreground">de {counter.target} min</span>
      <Progress value={Math.min(seconds / (counter.target * 60), 1) * 100} className="w-48" />
      <Button
        variant="outline"
        size="icon-lg"
        className="rounded-full"
        onClick={toggle}
        aria-label={stopwatch.running ? "Pausar" : "Empezar"}
      >
        {stopwatch.running ? <PauseIcon /> : <PlayIcon />}
      </Button>
    </div>
  );
}
