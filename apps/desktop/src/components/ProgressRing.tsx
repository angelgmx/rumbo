/** Anillo de progreso pequeño (0 a 1), en el color que se le pase. */
export function ProgressRing({
  value,
  color,
  size = 28,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const radius = size / 2 - 3;
  const length = 2 * Math.PI * radius;
  const filled = Math.min(Math.max(value, 0), 1) * length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${length}`}
        className="transition-[stroke-dasharray] duration-(--dur-page) ease-(--ease-enter)"
      />
    </svg>
  );
}
