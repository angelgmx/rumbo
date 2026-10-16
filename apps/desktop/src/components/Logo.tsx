import { cn } from "@/lib/utils";

/** La aguja de brújula de Rumbo: mitad bermellón, mitad tinta. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-8 rounded-lg bg-[#F4F2EE] shadow-card", className)}
    >
      <g transform="rotate(45 16 16)">
        <path d="M16 6 L19.5 16 H12.5 Z" fill="#FF5B2E" />
        <path d="M16 26 L12.5 16 H19.5 Z" fill="#18181B" />
      </g>
    </svg>
  );
}
