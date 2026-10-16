import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CounterControl } from "@/features/counters/CounterControl";
import type { CountedTask } from "@/features/counters/countedTask";

/** «Ahora» cuando lo que toca es una tarea del foco con contador: el contador en grande. */
export function NowTaskCard({ task }: { task: CountedTask }) {
  return (
    <Card className="border-primary/60 bg-linear-to-br from-primary-soft to-card">
      <CardHeader>
        <CardDescription className="font-mono text-xs tracking-widest text-primary-text uppercase">
          Ahora · foco
        </CardDescription>
        <CardTitle className="text-lg">{task.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <CounterControl key={`${task.path}:${task.line}`} task={task} />
      </CardContent>
    </Card>
  );
}
