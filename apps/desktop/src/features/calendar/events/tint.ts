/** El color mezclado con transparencia, para fondos y bordes suaves. */
export function tint(color: string, percent: number): string {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
}
