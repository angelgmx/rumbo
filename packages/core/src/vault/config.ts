import { parse } from "yaml";
import { z } from "zod";
import type { FileSystem } from "../ports";

export const CONFIG_PATH = ".rumbo/config.yml";

const configSchema = z.object({
  folders: z
    .object({
      daily: z.string().default("Daily"),
      daily_format: z.string().default("YYYY-MM-DD"),
      inbox: z.string().default("Inbox.md"),
      habits: z.string().default("Habits"),
      goals: z.string().default("Goals"),
      routines: z.string().default("Routines"),
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

export type RumboConfig = z.infer<typeof configSchema>;
export type PomodoroSettings = RumboConfig["pomodoro"];

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
