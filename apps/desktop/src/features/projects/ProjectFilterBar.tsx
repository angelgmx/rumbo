import type { ProjectSummary } from "@rumbo/core";
import { FilterSelect } from "@/components/FilterSelect";
import { SearchInput } from "@/components/SearchInput";
import { useAreaNames } from "@/hooks/useAreaNames";
import type { ProjectFilters, StatusFilter } from "./projectFilters";
import { STATUS_LABEL, STATUS_ORDER } from "./projectLabels";

const STATUS_OPTIONS = [
  { value: "all", label: "todos" },
  ...STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
];

/** Los filtros de la página de proyectos: área, objetivo, estado y un buscador. */
export function ProjectFilterBar({
  projects,
  filters,
  onChange,
}: {
  projects: ProjectSummary[];
  filters: ProjectFilters;
  onChange: (changes: Partial<ProjectFilters>) => void;
}) {
  const areas = useAreaNames();
  const goalTitles = new Map(
    projects.flatMap(({ goal }) => (goal ? [[goal.id, goal.title] as const] : [])),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Área"
        allLabel="todas"
        options={areas.map((name) => ({ value: name, label: name }))}
        value={filters.area}
        onChange={(area) => onChange({ area })}
      />
      <FilterSelect
        label="Objetivo"
        allLabel="todos"
        options={[...goalTitles].map(([id, title]) => ({ value: String(id), label: title }))}
        value={filters.goalId === undefined ? undefined : String(filters.goalId)}
        onChange={(goalId) =>
          onChange({ goalId: goalId === undefined ? undefined : Number(goalId) })
        }
      />
      <FilterSelect
        label="Estado"
        allLabel="activos"
        options={STATUS_OPTIONS}
        value={filters.status === "open" ? undefined : filters.status}
        onChange={(status) => onChange({ status: (status as StatusFilter | undefined) ?? "open" })}
      />
      <SearchInput
        value={filters.query}
        placeholder="Buscar proyecto"
        onChange={(query) => onChange({ query })}
        className="ml-auto w-64"
      />
    </div>
  );
}
