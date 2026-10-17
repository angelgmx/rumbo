import {
  blocksAround,
  chooseStart,
  MAX_BAD_DAYS_PER_MONTH,
  minutesBetween,
  type HabitSummary,
  type RoutineStep,
  type Task,
} from "@rumbo/core";
import { CheckIcon } from "lucide-react";
import { Link } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { timeOf, useNow } from "@/hooks/useNow";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useSession } from "@/features/session/SessionProvider";
import { choiceRequest, focusNumber, QUICK_MINUTES, type FocusChoice } from "./choice";
import { dayCount, untimedTasks } from "./dayCount";
import { dayEntries, nextEntry, routineOfHabits } from "./dayEntries";
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
  const entries = dayEntries(day.plan, day.groups);

  const otherTasks = untimedTasks(day);
  const { done: doneCount, total } = dayCount(day);

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
      <ScreenHeader
        title="Foco"
        actions={
          <Button variant="outline" render={<Link href="/cerrar-el-dia" />}>
            <CheckIcon data-icon="inline-start" />
            Cerrar el día
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <FocusHeader
            today={today}
            greeting={greeting(now)}
            done={doneCount}
            total={total}
            hasNow={choice !== undefined}
          />

          <div className="grid grid-cols-[1fr_460px] items-start gap-6">
            <div className="flex flex-col gap-6">
              <DayPlanCard
                entries={entries}
                time={time}
                current={around.now}
                onToggleBlock={(item, done) => rumbo.agenda.setDone(today, item.block, done)}
                onCompleteStep={completeStep}
              />
              <UntimedCard
                focus={day.focus}
                tasks={otherTasks}
                onToggle={toggleTask}
                onOpen={taskPanel.edit}
              />
            </div>
            <div className="flex flex-col gap-6">
              <NowCard
                choice={choice}
                focusNumber={focusNumber(choice, day.focus)}
                next={nextEntry(entries, time)?.title}
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
              <TodayHabitsCard habits={day.habits} routines={routineOfHabits(day.groups)} />
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
