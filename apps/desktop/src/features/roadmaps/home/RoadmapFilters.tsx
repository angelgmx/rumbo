import type { TopicSummary } from "@rumbo/core";
import { SegmentedControl } from "@/components/SegmentedControl";
import { FilterChip } from "@/features/tasks/FilterChip";
import { areaOf, countIn, type StatusFilter } from "./roadmapList";

interface RoadmapFiltersProps {
  topics: TopicSummary[];
  status: StatusFilter;
  area: string | undefined;
  onStatusChange: (status: StatusFilter) => void;
  onAreaChange: (area: string | undefined) => void;
}

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "paused", label: "Pausadas" },
  { value: "done", label: "Completadas" },
];

/** Estado en un control segmentado y área en un chip, como en Objetivos y Tareas. */
export function RoadmapFilters({
  topics,
  status,
  area,
  onStatusChange,
  onAreaChange,
}: RoadmapFiltersProps) {
  const areas = [...new Map(topics.map((topic) => [areaOf(topic).path, areaOf(topic)])).values()];
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SegmentedControl
        label="Estado"
        options={STATUSES.map((option) => ({
          ...option,
          label: `${option.label} ${countIn(topics, option.value)}`,
        }))}
        value={status}
        onChange={onStatusChange}
      />
      <FilterChip
        label="Área"
        value={area}
        onChange={onAreaChange}
        options={areas.map((option) => ({
          value: option.path,
          label: option.title,
          count: topics.filter((topic) => areaOf(topic).path === option.path).length,
          icon: (
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-[3px]"
              style={{ backgroundColor: option.color ?? "var(--muted-foreground)" }}
            />
          ),
        }))}
      />
    </div>
  );
}
