import type { CountedTask } from "./countedTask";
import { MinutesCounter } from "./MinutesCounter";
import { PomodoroCounter } from "./PomodoroCounter";
import { StepCounter } from "./StepCounter";

/** El contador «en marcha» de una tarea: cada tipo trae su propio control. */
export function CounterControl({ task }: { task: CountedTask }) {
  switch (task.counter.kind) {
    case "minutes":
      return <MinutesCounter task={task} />;
    case "pomodoro":
      return <PomodoroCounter task={task} />;
    case "count":
    case "progress":
      return <StepCounter task={task} />;
  }
}
