import { LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiProvider } from "@/features/ai/useAiProvider";

/** «Completar con IA», discreto bajo la cabecera: solo sale con la IA configurada. */
export function CompleteButton({ thinking, onClick }: { thinking: boolean; onClick: () => void }) {
  if (useAiProvider() === undefined) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      disabled={thinking}
      onClick={onClick}
    >
      {thinking ? (
        <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
      ) : (
        <SparklesIcon data-icon="inline-start" />
      )}
      Completar con IA
    </Button>
  );
}
