import { CheckCircle2Icon, CircleAlertIcon, LoaderCircleIcon, PlugZapIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createAiProvider, describeAiError } from "@/features/ai/aiProvider";
import { isAiReady, type AiSettings } from "@/features/ai/aiSettings";

type TestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "ok"; seconds: number }
  | { status: "error"; message: string };

const PROBE = [{ role: "user" as const, content: "Responde solo con: ok" }];

/** «Probar»: una pregunta mínima para saber si URL, modelo y clave funcionan juntos. */
export function ConnectionTest({ settings, apiKey }: { settings: AiSettings; apiKey?: string }) {
  const [state, setState] = useState<TestState>({ status: "idle" });

  async function test() {
    setState({ status: "testing" });
    const started = performance.now();
    try {
      await createAiProvider(settings, apiKey).complete(PROBE);
      setState({ status: "ok", seconds: (performance.now() - started) / 1000 });
    } catch (error) {
      setState({ status: "error", message: describeAiError(error) });
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={test}
        disabled={!isAiReady(settings) || state.status === "testing"}
      >
        {state.status === "testing" ? (
          <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
        ) : (
          <PlugZapIcon data-icon="inline-start" />
        )}
        Probar
      </Button>
      <TestResult state={state} />
    </div>
  );
}

function TestResult({ state }: { state: TestState }) {
  if (state.status === "ok") {
    return (
      <p className="flex items-center gap-2 text-sm text-success">
        <CheckCircle2Icon className="size-4" />
        Funciona · responde en {state.seconds.toFixed(1).replace(".", ",")} s
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p className="flex items-center gap-2 text-sm text-destructive">
        <CircleAlertIcon className="size-4" />
        {state.message}
      </p>
    );
  }
  return null;
}
