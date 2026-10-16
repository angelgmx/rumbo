import { isCounterComplete } from "@rumbo/core";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { formatClock, useCountdown } from "@/hooks/useCountdown";
import type { CountedTask } from "./countedTask";

type Phase = "work" | "rest";

/**
 * Ciclos de trabajo y descanso. Cada ciclo de trabajo terminado suma uno al
 * contador; el descanso no se guarda, solo se cuenta en pantalla. Con `autoStart` arranca al montarse.
 */
export function PomodoroCounter({ task, autoStart }: { task: CountedTask; autoStart?: boolean }) {
  const rumbo = useRumbo();
  const { work, rest } = rumbo.store.config.pomodoro;
  const [phase, setPhase] = useState<Phase>("work");
  const countdown = useCountdown(work, finishPhase);
  const { counter } = task;

  const begin = useEffectEvent(() => countdown.start(work));
  useEffect(() => {
    if (autoStart) begin();
  }, [autoStart]);

  function finishPhase() {
    if (phase === "rest") {
      setPhase("work");
      toast("Descanso terminado. Cuando quieras, el siguiente ciclo.");
      return;
    }
    void rumbo.tasks.stepCounter(task, 1);
    setPhase("rest");
    countdown.start(rest);
    toast.success(`Ciclo hecho. Descansa ${rest} min.`);
  }

  // Si la cuenta llegó a cero, el botón arranca la fase entera; si no, pausa o sigue.
  function play() {
    if (countdown.secondsLeft === 0) countdown.start(phase === "work" ? work : rest);
    else countdown.toggle();
  }

  const phaseSeconds = (phase === "work" ? work : rest) * 60;
  const done = isCounterComplete(counter);
  const cycle = Math.min(counter.current + 1, counter.target);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid place-items-center">
        <ProgressRing
          value={1 - countdown.secondsLeft / phaseSeconds}
          color="var(--primary)"
          size={148}
          stroke={8}
        />
        <span className="absolute font-mono text-3xl font-medium tabular-nums">
          {formatClock(countdown.secondsLeft)}
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm">
          {done
            ? `${counter.target} ciclos hechos`
            : `${phase === "work" ? "Ciclo" : "Descanso tras el ciclo"} ${cycle} de ${counter.target} · ${work}/${rest}`}
        </p>
        {!done && phase === "work" && (
          <p className="text-xs text-muted-foreground">luego descanso {rest} min</p>
        )}
      </div>
      {!done && (
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full"
          onClick={play}
          aria-label={countdown.running ? "Pausar" : "Empezar"}
        >
          {countdown.running ? <PauseIcon /> : <PlayIcon />}
        </Button>
      )}
    </div>
  );
}
