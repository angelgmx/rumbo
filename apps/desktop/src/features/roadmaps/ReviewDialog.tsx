import type { ReviewCard, ReviewRating } from "@rumbo/core";
import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { cn } from "@/lib/utils";

const ANSWERS: { rating: ReviewRating; label: string; key: string }[] = [
  { rating: "again", label: "Otra vez", key: "1" },
  { rating: "hard", label: "Difícil", key: "2" },
  { rating: "good", label: "Bien", key: "3" },
  { rating: "easy", label: "Fácil", key: "4" },
];

/** Los conceptos que toca repasar hoy; con `roadmap`, solo los de esa ruta. */
export function useDueCards(roadmap?: string): ReviewCard[] {
  return (
    useVaultQuery(
      (r) => r.review.due().filter((card) => !roadmap || card.roadmap === roadmap),
      [roadmap],
    ).data ?? []
  );
}

/** Unos 30 segundos por concepto. */
export function reviewMinutes(cards: number): number {
  return Math.max(1, Math.round(cards * 0.5));
}

/** Abre el repaso recordando cuántas había al empezar, para la barra de progreso. */
export function useReview(due: number, roadmap?: string) {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  return {
    open,
    start: () => {
      setTotal(due);
      setOpen(true);
    },
    dialog: { open, total, roadmap, onOpenChange: setOpen },
  };
}

interface ReviewDialogProps {
  open: boolean;
  total: number;
  roadmap?: string;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({ open, total, roadmap, onOpenChange }: ReviewDialogProps) {
  const rumbo = useRumbo();
  const cards = useDueCards(roadmap);
  const card = cards[0];

  useEffect(() => {
    if (!open || !card) return;
    function onKeyDown(event: KeyboardEvent) {
      const answer = ANSWERS.find((option) => option.key === event.key);
      if (answer && card) void rumbo.review.answer(card, answer.rating);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, card, rumbo]);

  const answered = total - cards.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-7 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Repaso</DialogTitle>
          <DialogDescription>
            Explícalo con tus palabras antes de responder (en voz alta vale).
          </DialogDescription>
        </DialogHeader>
        {total > 0 && (
          <div className="flex flex-col gap-2">
            <Progress value={(answered / total) * 100} className="h-1" />
            <span className="self-end font-mono text-xs text-muted-foreground">
              {Math.min(answered + 1, total)} de {total}
            </span>
          </div>
        )}
        {card ? <Question card={card} /> : <Finished />}
      </DialogContent>
    </Dialog>
  );
}

function Question({ card }: { card: ReviewCard }) {
  const rumbo = useRumbo();
  return (
    <div className="flex flex-col gap-4">
      <div className="min-h-36 rounded-xl border bg-muted/30 p-5">
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          {card.roadmap} · {card.module.title}
        </span>
        <p className="mt-3 text-xl leading-snug font-medium">{card.concept}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ANSWERS.map((answer) => (
          <Button
            key={answer.rating}
            variant={answer.rating === "good" ? "default" : "outline"}
            className="h-auto flex-col gap-1 py-3 text-sm"
            onClick={() => rumbo.review.answer(card, answer.rating)}
          >
            <span>{answer.label}</span>
            <span
              className={cn(
                "font-mono text-xs",
                answer.rating === "good" ? "opacity-80" : "text-muted-foreground",
              )}
            >
              {answer.key} · {card.intervals[answer.rating]} d
            </span>
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Atajos: 1, 2, 3 y 4</p>
    </div>
  );
}

function Finished() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckIcon />
        </EmptyMedia>
        <EmptyTitle>Repaso hecho</EmptyTitle>
        <EmptyDescription>Vuelve mañana: Rumbo te enseñará solo lo que toque.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
