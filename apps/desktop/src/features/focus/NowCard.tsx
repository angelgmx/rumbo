import type { DayPlanItem, NowAndNext } from "@rumbo/core";
import { PauseIcon, TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatClock, type Countdown } from "@/hooks/useCountdown";

/** "Ahora": lo que toca en este momento y el temporizador de foco. */
export function NowCard({
  blocks,
  timer,
  onStart,
}: {
  blocks: NowAndNext<DayPlanItem>;
  timer: Countdown;
  onStart: () => void;
}) {
  const { now, next } = blocks;
  const title = now?.text ?? (next ? `A las ${next.start}: ${next.text}` : "Nada más en la agenda");

  return (
    <Card className="border-primary/60 bg-linear-to-br from-primary-soft to-card">
      <CardHeader>
        <CardDescription className="font-mono text-xs tracking-widest text-primary-text uppercase">
          {now ? "Ahora" : "Lo siguiente"}
        </CardDescription>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-baseline gap-3">
        <span className="font-mono text-6xl font-medium tracking-tight tabular-nums">
          {formatClock(timer.secondsLeft)}
        </span>
        <span className="text-sm text-muted-foreground">bloque de foco</span>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex gap-2">
          {timer.running ? (
            <Button variant="outline" onClick={timer.toggle}>
              <PauseIcon data-icon="inline-start" />
              Pausar
            </Button>
          ) : (
            <Button onClick={onStart}>
              <TimerIcon data-icon="inline-start" />
              Iniciar foco
            </Button>
          )}
        </div>
        {now && next && (
          <p className="text-sm text-muted-foreground">
            Después: {next.text} · {next.start}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
