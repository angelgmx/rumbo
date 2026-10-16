import type { SessionState } from "./types";

// Todo en localStorage: la sesión en curso sobrevive a una recarga sin tocar el vault.

const SESSION_KEY = "rumbo.session";
const WIDGET_KEY = "rumbo.session.widget";

export interface StoredSession {
  state: SessionState;
  secondsLeft: number;
  /** Cuándo termina, si estaba en marcha. */
  endsAt?: number;
}

export const CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
export type Corner = (typeof CORNERS)[number];

export interface WidgetLook {
  corner: Corner;
  hidden: boolean;
}

export const DEFAULT_LOOK: WidgetLook = { corner: "bottom-right", hidden: false };

export function loadSession(): StoredSession | undefined {
  const value = read(SESSION_KEY);
  if (!isStoredSession(value)) return undefined;
  return { ...value, state: { ...value.state, rounds: value.state.rounds ?? 0 } };
}

export function saveSession(stored: StoredSession | undefined): void {
  write(SESSION_KEY, stored);
}

export function loadLook(): WidgetLook {
  const value = read(WIDGET_KEY);
  return isLook(value) ? value : DEFAULT_LOOK;
}

export function saveLook(look: WidgetLook): void {
  write(WIDGET_KEY, look);
}

function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return undefined;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento la sesión sigue, solo que no sobrevive a una recarga.
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function isLook(value: unknown): value is WidgetLook {
  return (
    isObject(value) &&
    typeof value.hidden === "boolean" &&
    CORNERS.some((corner) => corner === value.corner)
  );
}

// Las sesiones guardadas antes de contar rondas no tienen `rounds`.
type SavedSession = Omit<StoredSession, "state"> & {
  state: Omit<SessionState, "rounds"> & { rounds?: number };
};

function isStoredSession(value: unknown): value is SavedSession {
  if (!isObject(value) || !isObject(value.state) || !isObject(value.state.request)) return false;
  const { state } = value;
  const request = state.request as Record<string, unknown>;
  return (
    typeof value.secondsLeft === "number" &&
    (value.endsAt === undefined || typeof value.endsAt === "number") &&
    typeof state.length === "number" &&
    typeof state.banked === "number" &&
    typeof state.finished === "boolean" &&
    typeof state.pomodoro === "boolean" &&
    typeof state.resting === "boolean" &&
    (state.rounds === undefined || typeof state.rounds === "number") &&
    typeof request.title === "string" &&
    typeof request.minutes === "number"
  );
}
