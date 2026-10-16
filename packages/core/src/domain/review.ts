import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";

// Repaso espaciado con FSRS. Cada concepto que ya sabes es una tarjeta; FSRS decide
// cuándo vuelve a salir según cómo de bien lo recordaste.

export type ReviewRating = "again" | "hard" | "good" | "easy";

/** Lo que se guarda de cada tarjeta en el frontmatter del tema (nombres cortos para que se lea bien). */
export interface ReviewState {
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
  last?: string;
}

const GRADES: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

// Se repasa una vez al día, así que no tienen sentido los pasos de minutos: todo va en días.
const scheduler = fsrs({ enable_short_term: false, enable_fuzz: false });

/** Una tarjeta sin repasar nunca toca ya. */
export function isDue(state: ReviewState | undefined, now: Date): boolean {
  return state === undefined || new Date(state.due) <= now;
}

export function rate(state: ReviewState | undefined, rating: ReviewRating, now: Date): ReviewState {
  const { card } = scheduler.next(toCard(state, now), now, GRADES[rating]);
  return {
    due: card.due.toISOString(),
    stability: round(card.stability),
    difficulty: round(card.difficulty),
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last: now.toISOString(),
  };
}

/** Cuántos días tardaría en volver con cada respuesta, para enseñarlo en los botones. */
export function nextIntervals(
  state: ReviewState | undefined,
  now: Date,
): Record<ReviewRating, number> {
  const days = (rating: ReviewRating) =>
    Math.max(
      1,
      Math.round((new Date(rate(state, rating, now).due).getTime() - now.getTime()) / 86_400_000),
    );
  return { again: days("again"), hard: days("hard"), good: days("good"), easy: days("easy") };
}

function toCard(state: ReviewState | undefined, now: Date): Card {
  if (!state) return createEmptyCard(now);
  return {
    ...createEmptyCard(now),
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state,
    last_review: state.last ? new Date(state.last) : undefined,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
