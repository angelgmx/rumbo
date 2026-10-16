import { parse } from "yaml";
import { z } from "zod";
import type { FileSystem } from "../ports";

export const CONFIG_PATH = ".rumbo/config.yml";

const rawSchema = z.object({
  folders: z
    .object({
      daily: z.string().default("Daily"),
      daily_format: z.string().default("YYYY-MM-DD"),
      inbox: z.string().default("Inbox.md"),
      ideas: z.string().optional(),
      goals: z.string().default("Goals"),
      projects: z.string().default("Projects"),
      templates: z.string().optional(),
    })
    .prefault({}),
  // Minutos de trabajo y descanso, y bloques por defecto de una tarea de pomodoros.
  pomodoro: z
    .object({
      work: z.number().int().positive().default(25),
      rest: z.number().int().positive().default(5),
      cycles: z.number().int().positive().default(4),
    })
    .prefault({}),
  // Los vaults antiguos pueden usar sus propios nombres: { estado: status }.
  aliases: z.record(z.string(), z.string()).default({}),
});

// La nota antigua de ideas, si no se dice, está junto a la del inbox (solo se lee para importarla).
const configSchema = rawSchema.transform((config) => ({
  ...config,
  folders: {
    ...config.folders,
    ideas: config.folders.ideas ?? besideInbox(config.folders.inbox, "Ideas.md"),
  },
}));

function besideInbox(inbox: string, name: string): string {
  const folder = inbox.slice(0, inbox.lastIndexOf("/") + 1);
  return `${folder}${name}`;
}

export type RumboConfig = z.infer<typeof configSchema>;

export async function loadConfig(fs: FileSystem): Promise<RumboConfig> {
  const raw = (await fs.exists(CONFIG_PATH)) ? parse(await fs.read(CONFIG_PATH)) : {};
  return configSchema.parse(raw ?? {});
}

/** Cambia los alias por la clave real, salvo que la clave real ya exista. */
export function applyAliases(
  data: Record<string, unknown>,
  aliases: Record<string, string>,
): Record<string, unknown> {
  const result = { ...data };
  for (const [alias, key] of Object.entries(aliases)) {
    if (alias in result && !(key in result)) {
      result[key] = result[alias];
      delete result[alias];
    }
  }
  return result;
}
