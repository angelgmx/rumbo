import { blocksAround, minutesBetween, type DayPlanItem, type Task } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { Progress } from "@/components/ui/progress";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { timeOf, useNow } from "@/hooks/useNow";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { capitalize, formatDay } from "@/lib/format";
import { NextStepCard } from "@/features/learn/NextStepCard";
import { ReviewTodayCard } from "@/features/learn/ReviewDialog";
import { DayPlanCard } from "./DayPlanCard";
import { NowCard } from "./NowCard";
import { TodayHabitsCard } from "./TodayHabitsCard";
import { UntimedCard } from "./UntimedCard";
import { useFocusTimer } from "./useFocusTimer";
import { WeekCard } from "./WeekCard";

const DEFAULT_FOCUS_MINUTES = 50;

export function TodayScreen() {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const now = useNow();
  const timer = useFocusTimer();

  const plan = useVaultQuery((r) => r.dayPlan.plan(today), [today]).data ?? [];
  const focus = useVaultQuery((r) => r.tasks.focus(), [today]).data ?? [];
  const todayTasks = useVaultQuery((r) => r.tasks.list("today"), [today]).data ?? [];
  const week = useVaultQuery((r) => r.progress.week(today), [today]).data ?? [];
  const habits = useVaultQuery((r) => r.habits.dueOn(today), [today]).data ?? [];
  // El tema que estás estudiando ahora (el primero con un módulo pendiente en su ruta).
  const learning = useVaultQuery((r) =>
    r.learning.topics().find((topic) => topic.roadmap?.current),
  ).data;

  const around = blocksAround(plan, timeOf(now));
  // Una tarea del foco con fecha de hoy saldría dos veces.
  const otherTasks = todayTasks.filter(
    (task) =>
      // Las de un hábito ya salen dentro de su hábito.
      !task.fields.habit && !focus.some((f) => f.path === task.path && f.line === task.line),
  );
  // Los hábitos se cuentan aparte (todos, tengan hora o no), así que del plan solo entra la agenda.
  const blocks = plan.filter((item) => item.kind === "agenda");
  const items = [...blocks, ...focus, ...otherTasks];
  const doneCount =
    items.filter((item) => item.done).length + habits.filter((h) => h.doneToday).length;
  const total = items.length + habits.length;

  function startFocus(block = around.now) {
    const minutes = block ? minutesLeft(block, timeOf(now)) : 0;
    timer.start(minutes > 0 ? minutes : DEFAULT_FOCUS_MINUTES);
  }

  const toggleTask = (task: Task, done: boolean) => rumbo.tasks.setDone(task, done);

  return (
    <>
      <ScreenHeader title="Hoy" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {capitalize(formatDay(today))}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {greeting(now)} Te quedan {total - doneCount} cosas para hoy.
              </p>
            </div>
            <div className="flex w-64 flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>
                  {doneCount} de {total} hecho
                </span>
                <span className="font-mono text-muted-foreground">
                  {total ? Math.round((doneCount / total) * 100) : 0} %
                </span>
              </div>
              <Progress value={total ? (doneCount / total) * 100 : 0} />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_380px] items-start gap-6">
            <div className="flex flex-col gap-6">
              <DayPlanCard
                items={plan}
                current={around.now}
                onToggleBlock={(item, done) => rumbo.agenda.setDone(today, item.block, done)}
                onHabitChange={(key, value) => rumbo.habits.setValue(key, value)}
                onStart={startFocus}
              />
              <UntimedCard
                focus={focus}
                tasks={otherTasks}
                onToggle={toggleTask}
                onCapture={async (text) => void (await rumbo.tasks.capture(text))}
              />
            </div>
            <div className="flex flex-col gap-6">
              <NowCard blocks={around} timer={timer} onStart={() => startFocus()} />
              {learning && <NextStepCard topic={learning} />}
              <ReviewTodayCard />
              <TodayHabitsCard
                habits={habits}
                onChange={(key, value) => rumbo.habits.setValue(key, value)}
              />
              <WeekCard week={week} today={today} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/** Lo que le queda a un bloque desde ahora (o entero, si aún no ha empezado). */
function minutesLeft(block: DayPlanItem, time: string): number {
  if (!block.end) return 0;
  return minutesBetween(time > block.start ? time : block.start, block.end);
}

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 14) return "Buenos días.";
  if (hour < 21) return "Buenas tardes.";
  return "Buenas noches.";
}
