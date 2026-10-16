import { MinusIcon, PlusIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CountedTask } from "./countedTask";
import { Segments } from "./Segments";

// Más casillas que esto ya no se leen de un vistazo: mejor una barra.
const MAX_DOTS = 12;

/** Contar a mano (vasos, páginas) o avanzar partes de un total (ejercicios 3 de 5). */
export function StepCounter({ task }: { task: CountedTask }) {
  const rumbo = useRumbo();
  const { counter } = task;
  const isProgress = counter.kind === "progress";
  const step = (delta: number) => rumbo.tasks.stepCounter(task, delta);

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="font-mono text-5xl font-medium tracking-tight tabular-nums">
        {isProgress ? `${counter.current} / ${counter.target}` : counter.current}
      </span>
      {!isProgress && <span className="text-sm text-muted-foreground">de {counter.target}</span>}
      {counter.target <= MAX_DOTS ? (
        <Segments
          done={counter.current}
          total={counter.target}
          shape={isProgress ? "bar" : "dot"}
          className={isProgress ? "w-48" : undefined}
        />
      ) : (
        <Progress value={(counter.current / counter.target) * 100} className="w-48" />
      )}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => step(-1)}
          disabled={counter.current === 0}
          aria-label="Quitar uno"
        >
          <MinusIcon />
        </Button>
        <Button
          size="icon-lg"
          onClick={() => step(1)}
          disabled={isProgress && counter.current >= counter.target}
          aria-label="Sumar uno"
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
