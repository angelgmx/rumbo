export type { Clock, DirEntry, FileSystem } from "./ports";
export { systemClock } from "./ports";

export { createRumbo, type Rumbo } from "./app/rumbo";
export { createNewVault } from "./app/newVault";
export type { SavedView } from "./app/savedViewService";
export type { DayPlanItem } from "./app/dayPlanService";
export type {
  AreaRef,
  ChallengeSummary,
  ModuleSummary,
  NoteFolder,
  ResourceOwner,
  RoadmapSummary,
  TopicSummary,
} from "./app/learningService";
export {
  exerciseMinutes,
  sessionStart,
  weekSessions,
  type StudySlot,
  type WeekSessions,
} from "./domain/planner";
export { capacityUntil, trimToFit, type Pace, type PaceState } from "./domain/pace";
export type { RoadmapStatus, Track } from "./domain/roadmaps";
export type { ReviewCard } from "./app/reviewService";
export type { ReviewRating } from "./domain/review";
export {
  exerciseCode,
  exerciseLanguage,
  type Exercise,
  type ExerciseLevel,
} from "./domain/exercises";
export type { ModuleStatus } from "./domain/learning";
export { linkTarget } from "./domain/links";
export {
  layoutRoadmap,
  type LayoutItem,
  type LayoutLink,
  type LinkSide,
  type RoadmapLayout,
} from "./domain/roadmapLayout";
export { guessFromUrl, RESOURCE_KINDS, type Resource, type ResourceKind } from "./domain/resources";
export type { VaultStore } from "./app/vaultStore";
export type { HabitList, HabitSummary } from "./app/habitService";
export { MAX_FOCUS, type CaptureResult } from "./app/taskService";
export type { DayProgress } from "./app/progressService";
export type { RoutineChanges, RoutineList, RoutineSummary } from "./app/routineService";
export type { PomodoroSettings } from "./vault/config";

export {
  addMinutesToTime,
  blocksAround,
  minutesBetween,
  type AgendaBlock,
  type NewAgendaBlock,
  type NowAndNext,
  type Timed,
} from "./domain/agenda";
export {
  addDays,
  daysBetween,
  startOfWeek,
  toIsoDate,
  weekdayOf,
  WEEKDAYS,
  type IsoDate,
  type Weekday,
} from "./domain/dates";
export {
  challengeProgress,
  completionRate,
  habitProgress,
  habitStats,
  isDone,
  isScheduledOn,
  type Challenge,
  type Habit,
  type HabitInput,
  type HabitSchedule,
  type HabitStats,
  type HabitValue,
  type Streak,
} from "./domain/habits";
export { weekProgress } from "./domain/habits";
export {
  isInView,
  type Priority,
  type Task,
  type TaskChanges,
  type TaskDraft,
  type TaskView,
} from "./domain/tasks";
export { parseCapture, type Capture } from "./domain/capture";
export {
  COUNTER_KINDS,
  formatCounter,
  isCounterComplete,
  parseCounter,
  setCounterMinutes,
  stepCounter,
  type Counter,
  type CounterKind,
} from "./domain/counters";
export {
  BLOCK_KINDS,
  blockTitle,
  isRoutineOn,
  ROUTINE_KINDS,
  ROUTINE_TEMPLATES,
  routineSchema,
  type BlockKind,
  type Routine,
  type RoutineBlock,
  type RoutineClash,
  type RoutineInput,
  type RoutineTemplate,
  type TimedBlock,
} from "./domain/routines";
