import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { AI_PROVIDERS, type AiProviderKind } from "@/features/ai/aiSettings";
import { useAiKey, useAiSettings } from "@/features/ai/useAiSettings";
import { ApiKeyField } from "./ApiKeyField";
import { ConnectionTest } from "./ConnectionTest";
import { ProviderPicker } from "./ProviderPicker";

/** Ajustes › Inteligencia artificial: quién responde y cómo llegar a él. */
export function AiSettingsPage() {
  const { settings, update } = useAiSettings();
  const apiKey = useAiKey();
  if (!settings || apiKey.key === undefined) return null;

  const provider = AI_PROVIDERS[settings.provider];
  const changeProvider = (kind: AiProviderKind) =>
    update({ provider: kind, baseUrl: AI_PROVIDERS[kind].baseUrl });

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inteligencia artificial</h1>
        <p className="mt-1 text-muted-foreground">
          La app funciona igual sin IA. Aquí decides quién responde.
        </p>
      </div>

      <Section title="Proveedor">
        <ProviderPicker value={settings.provider} onChange={changeProvider} />
      </Section>

      {provider.needsKey && (
        <Section title="Clave de API">
          <ApiKeyField value={apiKey.key} onSave={apiKey.save} />
        </Section>
      )}

      <Section title="Conexión">
        <Row label="URL" description="Hasta la versión de la API, como /v1">
          <Input
            value={settings.baseUrl}
            onChange={(event) => update({ baseUrl: event.target.value })}
            aria-label="URL"
            className="font-mono"
          />
        </Row>
        <Row label="Modelo" description="El nombre tal como lo da tu proveedor">
          <Input
            value={settings.model}
            onChange={(event) => update({ model: event.target.value })}
            aria-label="Modelo"
            className="font-mono"
          />
        </Row>
        {/* Con otro proveedor, URL, modelo o clave, la prueba de antes ya no vale. */}
        <ConnectionTest
          key={[settings.provider, settings.baseUrl, settings.model, apiKey.key].join("|")}
          settings={settings}
          apiKey={apiKey.key}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_minmax(0,22rem)] items-center gap-6">
      <div>
        <p>{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
