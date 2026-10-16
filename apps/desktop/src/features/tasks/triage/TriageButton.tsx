import { BotIcon, LoaderCircleIcon } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

/** «Procesar con IA». Sin IA configurada, lleva a sus ajustes. */
export function TriageButton({
  ready,
  thinking,
  onPropose,
}: {
  ready: boolean;
  thinking: boolean;
  onPropose: () => void;
}) {
  const [, navigate] = useLocation();

  return (
    <Button
      variant="outline"
      disabled={thinking}
      onClick={ready ? onPropose : () => navigate("/ajustes/ia")}
    >
      {thinking ? (
        <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
      ) : (
        <BotIcon data-icon="inline-start" />
      )}
      Procesar con IA
    </Button>
  );
}
