export type {
  AiMessage,
  AiProvider,
  Clock,
  Database,
  DirEntry,
  FileSystem,
  HttpFetch,
  SqlValue,
} from "./ports";

export { AiError, type AiFailure } from "./ai/aiError";
export { anthropic } from "./ai/anthropic";
export { openAiCompatible } from "./ai/openAiCompatible";

export { createRumbo, type Rumbo, type RumboSources } from "./app/rumbo";

export { createNewVault } from "./app/newVault";
export type { TriageSuggestion } from "./app/inboxTriageService";
export type { OrganizeSuggestion } from "./app/taskOrganizerService";
export type { OrganizeProposal } from "./domain/taskOrganizing";
export { isIncomplete } from "./domain/taskGaps";

export { type Energy } from "./domain/closeDay";
export type { TriageKind } from "./domain/inboxTriage";
export type { SavedView } from "./app/savedViewService";
export type { DayPlanItem } from "./app/dayPlanService";
export type {
  ChallengeSummary,
  ModuleSummary,
  NoteFolder,
  ResourceOwner,
  RoadmapSummary,
  TopicSummary,
} from "./app/learningService";
export { exerciseMinutes, sessionStart, weekSessions, type StudySlot } from "./domain/planner";
export { capacityUntil, trimToFit } from "./domain/pace";
export { idleDays, isStalled } from "./domain/idle";
export type { RoadmapStatus, Track } from "./domain/roadmaps";
export type { ReviewCard } from "./app/reviewService";
export type { ReviewRating } from "./domain/review";
export {
  exerciseCode,
  exerciseLanguage,
  type Exercise,
  type ExerciseLevel,
} from "./domain/exercises";
export type { Concept, ModuleStatus } from "./domain/learning";
export { linkTarget } from "./domain/links";
export {
  layoutRoadmap,
  type LayoutItem,
  type LinkSide,
  type RoadmapLayout,
} from "./domain/roadmapLayout";
export {
  guessFromUrl,
  resourcesInText,
  type Resource,
  type ResourceKind,
} from "./domain/resources";

export type { HabitSummary } from "./app/habitService";
export { type CaptureResult } from "./app/taskService";

export type { RoutineClashes, RoutineStep, RoutineSummary } from "./app/routineService";
export { MAX_BAD_DAYS_PER_MONTH } from "./domain/badDays";
export {
  DEFAULT_SESSION_MINUTES,
  nextStudyStep,
  sessionMinutes,
  type StudyPlace,
} from "./domain/session";
export { chooseStart, type StartChoice } from "./domain/focus";

export { addMinutesToTime, blocksAround, minutesBetween } from "./domain/agenda";
export { parseDuration } from "./domain/duration";
export { endTime, type BusySlot } from "./domain/taskClash";
export type { TaskSlot } from "./app/taskClashService";
export { addDays, startOfWeek, WEEKDAYS, type IsoDate, type Weekday } from "./domain/dates";
export {
  completionRate,
  habitProgress,
  isDone,
  isScheduledOn,
  minimumOf,
  type Habit,
  type HabitInput,
  type HabitSchedule,
  type HabitValue,
  type Streak,
} from "./domain/habits";
export { weekProgress } from "./domain/habits";
export {
  isInView,
  isRecentlyDone,
  taskToDraft,
  type Priority,
  type Task,
  type TaskChanges,
  type TaskDraft,
  type TaskStep,
  type TaskView,
} from "./domain/tasks";
export type { Idea } from "./db/ideaRepository";
export { parseTaskTitle, type TaskTitle } from "./domain/capture";
export {
  BLOCK_KINDS,
  blockTitle,
  insertBlock,
  isRoutineOn,
  moveBlock,
  removeBlock,
  routineEnd,
  routineMinutes,
  routineSchema,
  timedBlocks,
  updateBlock,
  type BlockKind,
  type Routine,
  type RoutineBlock,
  type RoutineInput,
  type TimedBlock,
} from "./domain/routines";
export type { GoalDriverRefs, GoalLink, GoalRoadmap, GoalSummary } from "./app/goalService";
export type { ProjectSummary } from "./app/projectService";
export {
  GOAL_STATUSES,
  keyResultProgress,
  periodChoices,
  periodHorizon,
  type Goal,
  type GoalHorizon,
  type GoalInput,
  type GoalPace,
  type GoalPaceState,
  type KeyResult,
  type GoalStatus,
  type IfThen,
} from "./domain/goals";
export {
  PROJECT_STATUSES,
  type Milestone,
  type Project,
  type ProjectInput,
  type ProjectLink,
  type ProjectStatus,
} from "./domain/projects";
