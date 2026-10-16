import { cn } from "@/lib/utils";

const MARKS = [
  { label: "Dominado", className: "border-[1.6px] border-success rounded-full" },
  { label: "Aprendiendo", className: "border-[1.6px] border-primary border-r-input rounded-full" },
  { label: "Ahora", className: "bg-primary rounded-full" },
  { label: "Sin empezar", className: "border-[1.6px] border-input rounded-full" },
  {
    label: "Checkpoint",
    className: "border-[1.6px] border-warning rotate-45 rounded-[2px] size-2.5",
  },
];

/** La leyenda de los estados del diagrama. */
export function RoadmapLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
      {MARKS.map(({ label, className }) => (
        <span key={label} className="flex items-center gap-2">
          <span className={cn("size-3", className)} />
          {label}
        </span>
      ))}
    </div>
  );
}
