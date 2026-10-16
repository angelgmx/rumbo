import { MoonIcon, PauseIcon, PlayIcon, SparklesIcon, TimerIcon } from "lucide-react";
import { useEffect, useEffectEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { CounterControl } from "@/features/counters/CounterControl";
import { hasCounter } from "@/features/counters/countedTask";
import { cn } from "@/lib/utils";
import { describeChoice, QUICK_MINUTES, type FocusChoice } from "./choice";
import type { FocusTimer } from "./useFocusTimer";

interface NowCardProps {
  choice?: FocusChoice;
  timer: FocusTimer;
  badDay: { active: boolean; used: number; left: number };
  onStart: () => void;
  onQuickStart: () => void;
  onToggleBadDay: () => void;
}

/** «Ahora»: lo que toca empezar, por qué, y un único botón para hacerlo. */
export function NowCard({
  choice,
  timer,
  badDay,
  onStart,
  onQuickStart,
  onToggleBadDay,
}: NowCardProps) {
  const view = choice && describeChoice(choice);
  const counted = choice?.kind === "task" && hasCounter(choice.task) ? choice.task : undefined;

  const primary = () => (timer.state === "idle" ? onStart() : timer.toggle());
  const onSpace = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== "Space" || event.target !== document.body || !choice) return;
    event.preventDefault();
    primary();
  });
  useEffect(() => {
    window.addEventListener("keydown", onSpace);
    return () => window.removeEventListener("keydown", onSpace);
  }, []);

  return (
    <Card className="gap-4 border-primary/60 bg-linear-to-br from-primary-soft to-card p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[11px] font-medium tracking-widest text-primary-text uppercase">
          Ahora
        </p>
        {choice?.kind === "routine-step" && (
          <p className="font-mono text-xs text-muted-foreground">{choice.step.start}</p>
        )}
      </div>

      {view ? (
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{view.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{view.subtitle}</p>
        </div>
      ) : (
        <p className="text-muted-foreground">Nada pendiente por ahora. Buen trabajo.</p>
      )}

      {counted && <CounterControl key={`${counted.path}:${counted.line}`} task={counted} />}
      {timer.state !== "idle" && (
        <p className="font-mono text-5xl font-medium tracking-tight tabular-nums">{timer.clock}</p>
      )}

      {choice && (
        <>
          <Button size="lg" className="relative h-12 w-full text-base" onClick={primary}>
            {timer.state === "running" ? (
              <PauseIcon data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
            {timer.state === "idle" ? "Empezar" : timer.state === "running" ? "Pausar" : "Seguir"}
            {timer.state === "idle" && <Kbd className="absolute right-3">Espacio</Kbd>}
          </Button>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <SparklesIcon className="size-3.5 text-primary-text" />
            {choice.reason}
          </p>
        </>
      )}

      <div className="flex items-center gap-5 text-sm">
        {choice && (
          <button type="button" onClick={onQuickStart} className={link}>
            <TimerIcon className="size-4" />
            Solo {QUICK_MINUTES} minutos
          </button>
        )}
        <button
          type="button"
          onClick={onToggleBadDay}
          disabled={!badDay.active && badDay.left === 0}
          className={cn(link, badDay.active && "text-primary-text")}
        >
          <MoonIcon className="size-4" />
          Día malo
          <span className="text-muted-foreground">· {badDay.used} este mes</span>
        </button>
      </div>
    </Card>
  );
}

const link =
  "flex items-center gap-2 transition-colors hover:text-primary-text disabled:pointer-events-none disabled:opacity-50";
