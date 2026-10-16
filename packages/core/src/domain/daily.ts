import type { RumboConfig } from "../vault/config";
import { formatDate, type IsoDate } from "./dates";

export function dailyPath(config: RumboConfig, date: IsoDate): string {
  return `${config.folders.daily}/${formatDate(date, config.folders.daily_format)}.md`;
}

/**
 * Contenido de una daily nueva. Si el vault tiene plantilla "Daily", se usa
 * rellenando las fechas de Templater; si no, una sencilla por defecto.
 */
export function newDailyNote(date: IsoDate, template?: string): string {
  if (template) {
    return template.replace(/<%\s*tp\.date\.now\(\s*"YYYY-MM-DD"\s*\)\s*%>/g, date);
  }

  return [
    "---",
    "type: daily",
    `date: ${date}`,
    "---",
    "",
    "## Agenda",
    "",
    "## Notas del día",
    "",
  ].join("\n");
}
