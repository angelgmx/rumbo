import { MoonIcon, PlayIcon, SparklesIcon, TimerIcon } from "lucide-react";
import { useEffect, useEffectEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { useSession } from "@/features/session/SessionProvider";
import { StepsBar } from "@/features/tasks/StepsBar";
import { cn } from "@/lib/utils";
import { describeChoice, QUICK_MINUTES, type FocusChoice } from "./choice";

interface NowCardProps {
  choice?: FocusChoice;
  /** «Foco 01» si lo elegido es una tarea del foco del día. */
  focusNumber?: string;
  /** Lo que viene después en «Tu día». */
  next?: string;
  badDay: { active: boolean; used: number; left: number };
  onStart: () => void;
  onQuickStart: () => void;
  onToggleBadDay: () => void;
}

/** «Ahora»: lo que toca empezar, por qué, y un único botón para hacerlo. */
export function NowCard({
  choice,
  focusNumber,
  next,
  badDay,
  onStart,
  onQuickStart,
  onToggleBadDay,
}: NowCardProps) {
  const view = choice && describeChoice(choice);
  const task = choice?.kind === "task" ? choice.task : undefined;
  const steps = task?.steps ?? [];
  const stepsDone = steps.filter((step) => step.done).length;
  const { active } = useSession();

  const onSpace = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== "Space" || event.target !== document.body || !choice || active) return;
    event.preventDefault();
    onStart();
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
        <p className="font-mono text-xs text-muted-foreground">
          {[focusNumber, choice?.kind === "routine-step" && choice.step.start]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {view ? (
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{view.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{view.subtitle}</p>
        </div>
      ) : (
        <p className="text-muted-foreground">Nada pendiente por ahora. Buen trabajo.</p>
      )}

      {steps.length > 0 && <StepsProgress done={stepsDone} total={steps.length} />}

      {choice && (
        <>
          <Button size="lg" className="relative h-12 w-full text-base" onClick={onStart}>
            <PlayIcon data-icon="inline-start" />
            Empezar
            {!active && <Kbd className="absolute right-3">Espacio</Kbd>}
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
        {next && (
          <span className="ml-auto min-w-0 truncate text-muted-foreground">Después: {next}</span>
        )}
      </div>
    </Card>
  );
}

function StepsProgress({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
        Progreso
      </p>
      <p className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight">{done}</span>
        <span className="text-muted-foreground">/ {total} pasos</span>
      </p>
      <StepsBar done={done} total={total} />
    </div>
  );
}

const link =
  "flex shrink-0 items-center gap-2 whitespace-nowrap transition-colors hover:text-primary-text disabled:pointer-events-none disabled:opacity-50";
