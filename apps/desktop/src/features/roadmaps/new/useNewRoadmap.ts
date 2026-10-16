import type { RoadmapDraft } from "@rumbo/core";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { describeAiError } from "@/features/ai/aiProvider";
import { useAiProvider } from "@/features/ai/useAiProvider";

/** El borrador de la ruta y lo que la IA hace con él. Nada se escribe hasta crearla. */
export function useNewRoadmap() {
  const rumbo = useRumbo();
  const ai = useAiProvider();
  const [draft, setDraft] = useState<RoadmapDraft>();
  const [thinking, setThinking] = useState(false);

  /** Pide a la IA y deja su borrador. Si falla, lo dice y no cambia nada. */
  async function withAi(call: () => Promise<RoadmapDraft>): Promise<RoadmapDraft | undefined> {
    setThinking(true);
    try {
      const next = await call();
      setDraft(next);
      return next;
    } catch (error) {
      toast.error(describeAiError(error));
      return undefined;
    } finally {
      setThinking(false);
    }
  }

  return {
    draft,
    setDraft,
    thinking,
    aiReady: ai !== undefined,
    propose: async (wish: string) =>
      ai ? withAi(() => rumbo.newRoadmap.propose(ai, wish)) : undefined,
    revise: async (change: string) => {
      if (ai && draft) await withAi(() => rumbo.newRoadmap.revise(ai, draft, change));
    },
  };
}
