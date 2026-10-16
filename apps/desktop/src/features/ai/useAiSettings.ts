import { useEffect, useState } from "react";
import { loadAiKey, saveAiKey } from "@/platform/aiKey";
import { readSetting, writeSetting } from "@/platform/appSettings";
import { AI_SETTINGS_KEY, DEFAULT_AI_SETTINGS, type AiSettings } from "./aiSettings";

/** Los ajustes de la IA de esta instalación. Cada cambio se guarda al momento. */
export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettings>();

  useEffect(() => {
    readSetting<AiSettings>(AI_SETTINGS_KEY).then((saved) =>
      setSettings({ ...DEFAULT_AI_SETTINGS, ...saved }),
    );
  }, []);

  async function update(changes: Partial<AiSettings>) {
    if (!settings) return;
    const next = { ...settings, ...changes };
    setSettings(next);
    await writeSetting(AI_SETTINGS_KEY, next);
  }

  return { settings, update };
}

/** La clave de la IA. `undefined` mientras se lee del llavero; "" si no hay. */
export function useAiKey() {
  const [key, setKey] = useState<string>();

  useEffect(() => {
    loadAiKey().then((saved) => setKey(saved ?? ""));
  }, []);

  async function save(next: string) {
    await saveAiKey(next);
    setKey(next);
  }

  return { key, save };
}
