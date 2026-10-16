import type { GoalPaceState, GoalSummary } from "@rumbo/core";
import { formatMonthYear } from "@/lib/format";

const PACE_LABEL: Record<GoalPaceState, string> = {
  ahead: "Por delante",
  "on-track": "Al día",
  behind: "Por detrás",
  "at-risk": "En riesgo",
};

const PACE_STYLE: Record<GoalPaceState, string> = {
  ahead: "text-success",
  "on-track": "text-success",
  behind: "text-warning",
  "at-risk": "text-destructive",
};

const MUTED = "text-muted-foreground";

/** Cómo va el objetivo, para la etiqueta de la lista; sin plan o sin ritmo medido, nada que decir. */
export function paceChip({
  progress,
  pace,
}: Pick<GoalSummary, "progress" | "pace">): { label: string; style: string } | undefined {
  if (progress === undefined) return { label: "Sin plan", style: MUTED };
  return pace?.state && { label: PACE_LABEL[pace.state], style: PACE_STYLE[pace.state] };
}

export interface PaceReading {
  text: string;
  detail?: string;
  style: string;
}

/** La frase de ritmo del panel: «Vas 45 % por detrás · terminas en sep 2027». */
export function paceReading({
  progress,
  pace,
}: Pick<GoalSummary, "progress" | "pace">): PaceReading | undefined {
  if (progress === undefined) {
    return { text: "Sin plan todavía", detail: "añade algo para medir el ritmo", style: MUTED };
  }
  if (!pace) return undefined;
  if (!pace.state) return { text: "Aún es pronto para medir el ritmo", style: MUTED };

  const finish = pace.projectedFinish && `terminas en ${formatMonthYear(pace.projectedFinish)}`;
  return {
    text: paceSentence(pace.state, pace.differencePercent),
    detail: finish,
    style: PACE_STYLE[pace.state],
  };
}

function paceSentence(state: GoalPaceState, difference: number | undefined): string {
  if (state === "on-track") return "Vas al día";
  if (difference === undefined) return "Fuera de plazo";
  return difference > 0 ? `Vas ${difference} % por delante` : `Vas ${-difference} % por detrás`;
}
