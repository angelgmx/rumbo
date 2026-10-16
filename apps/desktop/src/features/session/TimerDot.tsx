import { ProgressRing } from "@/components/ProgressRing";

const SIZE = 24;

/** El widget oculto: un punto bermellón con el tiempo que queda como anillo fino. */
export function TimerDot({ remaining, onShow }: { remaining: number; onShow: () => void }) {
  return (
    <button
      type="button"
      aria-label="Mostrar el temporizador"
      onClick={onShow}
      className="relative grid place-items-center rounded-full"
      style={{ width: SIZE, height: SIZE }}
    >
      <ProgressRing value={remaining} color="var(--primary)" size={SIZE} stroke={1.5} />
      <span className="absolute size-3.5 rounded-full bg-primary" />
    </button>
  );
}
