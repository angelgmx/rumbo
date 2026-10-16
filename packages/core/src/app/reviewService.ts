import { isDue, nextIntervals, rate, type ReviewRating, type ReviewState } from "../domain/review";
import { setFrontmatter } from "../vault/frontmatter";
import type { DailyService } from "./dailyService";
import type { LearningService, ModuleSummary } from "./learningService";
import type { VaultStore } from "./vaultStore";

/** Clave del frontmatter del tema donde se guarda el repaso de sus conceptos. */
const REVIEW_KEY = "repaso";

export interface ReviewCard {
  module: ModuleSummary;
  roadmap: string;
  concept: string;
  state?: ReviewState;
  /** Días hasta la próxima vez con cada respuesta. */
  intervals: Record<ReviewRating, number>;
}

/**
 * Repaso de conceptos. Entran los que ya marcaste como sabidos en temas que
 * estás aprendiendo o dominas: es lo que se olvida si no se repasa.
 */
export class ReviewService {
  constructor(
    private readonly store: VaultStore,
    private readonly learning: LearningService,
    private readonly daily: DailyService,
  ) {}

  due(): ReviewCard[] {
    const now = this.daily.now();
    const cards: ReviewCard[] = [];

    for (const roadmap of this.learning.roadmaps()) {
      for (const module of roadmap.modules) {
        if (module.status !== "learning" && module.status !== "mastered") continue;
        const saved = reviewStates(this.store.get(module.path)?.data);

        for (const concept of module.content.concepts) {
          if (!concept.done) continue;
          const state = saved[concept.text];
          if (!isDue(state, now)) continue;
          cards.push({
            module,
            roadmap: roadmap.title,
            concept: concept.text,
            state,
            intervals: nextIntervals(state, now),
          });
        }
      }
    }
    return cards;
  }

  async answer(card: ReviewCard, rating: ReviewRating): Promise<void> {
    const source = await this.store.read(card.module.path);
    const next = rate(card.state, rating, this.daily.now());
    await this.store.write(
      card.module.path,
      setFrontmatter(source, [REVIEW_KEY, card.concept], next),
    );
  }
}

function reviewStates(data: Record<string, unknown> | undefined): Record<string, ReviewState> {
  const value = data?.[REVIEW_KEY];
  return typeof value === "object" && value !== null ? (value as Record<string, ReviewState>) : {};
}
