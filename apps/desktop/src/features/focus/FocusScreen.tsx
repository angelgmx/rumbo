import {
  blocksAround,
  chooseStart,
  MAX_BAD_DAYS_PER_MONTH,
  minutesBetween,
  type HabitSummary,
  type RoutineStep,
  type Task,
} from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { timeOf, useNow } from "@/hooks/useNow";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useSession } from "@/features/session/SessionProvider";
import { choiceRequest, QUICK_MINUTES, type FocusChoice } from "./choice";
import { dayEntries, routineOfHabits } from "./dayEntries";
import { DayPlanCard } from "./DayPlanCard";
import { FocusHeader } from "./FocusHeader";
import { NowCard } from "./NowCard";
import { StreakRiskCard } from "./StreakRiskCard";
import { TodayHabitsCard } from "./TodayHabitsCard";
import { UntimedCard } from "./UntimedCard";
import { useFocusDay, type RoutineGroup } from "./useFocusDay";

export function FocusScreen() {
  const rumbo = useRumbo();
  const taskPanel = useTaskPanel();
  const today = rumbo.daily.today();
  const now = useNow();
  const time = timeOf(now);
  const session = useSession();
  const day = useFocusDay(today);

  const choice: FocusChoice | undefined = chooseStart({
    time,
    steps: day.steps,
    focus: day.focus,
    atRisk: day.atRisk,
    nextStep: day.nextStep,
  });
  const around = blocksAround(day.plan, time);

  // Una tarea del foco con fecha de hoy saldría dos veces.
  const otherTasks = day.todayTasks.filter(
    (task) =>
      // Las de un hábito ya salen dentro de su hábito.
      !task.fields.habit && !day.focus.some((f) => f.path === task.path && f.line === task.line),
  );
  const blocks = day.plan.filter((item) => item.kind === "agenda");
  const items = [...blocks, ...day.focus, ...otherTasks];
  const doneCount =
    items.filter((item) => item.done).length + day.habits.filter((h) => h.doneToday).length;
  const total = items.length + day.habits.length;

  async function start(quick = false) {
    if (!choice) return;
    if (!quick && choice.kind === "next-step" && choice.step.topic.roadmap) {
      await rumbo.learning.planToday(choice.step.topic.roadmap);
    }
    const left =
      choice.kind === "routine-step"
        ? minutesBetween(time > choice.step.start ? time : choice.step.start, choice.step.end)
        : 0;
    const request = choiceRequest(rumbo, choice, left);
    session.start(quick ? { ...request, minutes: QUICK_MINUTES } : request);
  }

  async function toggleBadDay() {
    await rumbo.daily.setBadDay(today, !day.badDay);
  }

  const saveStreak = (summary: HabitSummary, amount: number) =>
    rumbo.habits.setValue(summary.habit.key, Math.max(amount, Number(summary.today) || 0));
  const completeStep = (group: RoutineGroup, step: RoutineStep) =>
    rumbo.routines.completeBlock(group.summary, step.index);
  const toggleTask = (task: Task, done: boolean) => rumbo.tasks.setDone(task, done);

  return (
    <>
      <ScreenHeader title="Foco" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <FocusHeader
            today={today}
            greeting={greeting(now)}
            done={doneCount}
            total={total}
            hasNow={choice !== undefined}
          />

          <div className="grid grid-cols-[1fr_380px] items-start gap-6">
            <div className="flex flex-col gap-6">
              <DayPlanCard
                entries={dayEntries(day.plan, day.groups)}
                time={time}
                current={around.now}
                onToggleBlock={(item, done) => rumbo.agenda.setDone(today, item.block, done)}
                onHabitChange={(key, value) => rumbo.habits.setValue(key, value)}
                onCompleteStep={completeStep}
              />
              <UntimedCard
                focus={day.focus}
                tasks={otherTasks}
                onToggle={toggleTask}
                onOpen={taskPanel.edit}
                onCapture={async (text) => void (await rumbo.tasks.capture(text))}
              />
            </div>
            <div className="flex flex-col gap-6">
              <NowCard
                choice={choice}
                badDay={{
                  active: day.badDay,
                  used: day.badDaysUsed,
                  left: MAX_BAD_DAYS_PER_MONTH - day.badDaysUsed,
                }}
                onStart={() => start()}
                onQuickStart={() => start(true)}
                onToggleBadDay={toggleBadDay}
              />
              {day.atRisk.length > 0 && <StreakRiskCard habits={day.atRisk} onSave={saveStreak} />}
              <TodayHabitsCard
                habits={day.habits}
                routines={routineOfHabits(day.groups)}
                onChange={(key, value) => rumbo.habits.setValue(key, value)}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 14) return "Buenos días.";
  if (hour < 21) return "Buenas tardes.";
  return "Buenas noches.";
}
