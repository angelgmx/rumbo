import type { ChallengeSummary, IsoDate, ModuleSummary, RoadmapSummary } from "@rumbo/core";

export interface Checkpoint {
  challenge: ChallengeSummary;
  /** El último módulo que lo enlaza: al dominarlo ya sabes todo lo que pide. */
  after: ModuleSummary;
  /** Cuándo llegas a él con tu horario, si se puede calcular. */
  date?: IsoDate;
}

/** Los retos de la ruta, cada uno colgado de su último módulo y en el orden de la ruta. */
export function checkpoints(roadmap: RoadmapSummary, challenges: ChallengeSummary[]): Checkpoint[] {
  const byChallenge = new Map<string, Checkpoint>();
  for (const module of roadmap.modules) {
    for (const linked of module.challenges) {
      const challenge = challenges.find((candidate) => candidate.path === linked.path);
      if (challenge) {
        byChallenge.set(challenge.path, {
          challenge,
          after: module,
          date: roadmap.plan.modules.get(module.path),
        });
      }
    }
  }
  return [...byChallenge.values()].sort((a, b) => a.after.order - b.after.order);
}

/** El primer reto que aún no has superado. */
export function nextCheckpoint(list: Checkpoint[]): Checkpoint | undefined {
  return list.find(({ challenge }) => {
    const { done, total } = challenge.requirements;
    return total === 0 || done < total;
  });
}

/** Un reto se desbloquea cuando dominas todos los temas que pide. */
export function isUnlocked(challenge: ChallengeSummary): boolean {
  return challenge.modules.length > 0 && challenge.modules.every((m) => m.status === "mastered");
}

/** «Reto 03 · Analizador de texto» */
export function checkpointLabel(challenge: { number?: string; title: string }): string {
  return challenge.number ? `Reto ${challenge.number} · ${challenge.title}` : challenge.title;
}
