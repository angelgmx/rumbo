import { guessFromUrl, type Resource, type TopicSummary } from "@rumbo/core";
import { EllipsisIcon, ExternalLinkIcon, FileTextIcon, LinkIcon, PlusIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRumbo } from "@/app/RumboContext";
import { OptionSelect } from "@/components/OptionSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { openUrl } from "@/platform/openUrl";
import { RESOURCE_STATUS_LABEL, RESOURCE_STATUS_STYLE } from "./moduleStatus";
import { ResourceIcon } from "./ResourceIcon";
import { Tag } from "./Tag";
import { topicResources, type ResourceItem } from "./topic";

type Filter = "all" | "pending" | "done" | "skip";
const COLUMNS = "grid-cols-[minmax(0,1fr)_180px_120px_200px_32px]";

/** Pestaña Recursos: todo lo que usas para aprender el tema, venga de donde venga. */
export function TopicResources({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const [filter, setFilter] = useState<Filter>("all");
  const items = topicResources(topic).filter(
    ({ resource }) =>
      filter === "all" ||
      resource.status === filter ||
      (filter === "pending" && resource.status === "doing"),
  );

  return (
    <div className="flex flex-col gap-4">
      <AddResourceForm topic={topic} />
      <Card className="gap-0 py-0">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <FileTextIcon className="size-4" />
          <span className="flex-1">Recursos de {topic.title}</span>
          <ToggleGroup
            variant="outline"
            size="sm"
            value={[filter]}
            onValueChange={(values) => values[0] && setFilter(values[0] as Filter)}
          >
            <ToggleGroupItem value="all">Todos</ToggleGroupItem>
            <ToggleGroupItem value="pending">Pendientes</ToggleGroupItem>
            <ToggleGroupItem value="done">Vistos</ToggleGroupItem>
            <ToggleGroupItem value="skip">Saltados</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div
          className={cn(
            "grid items-center gap-4 border-b px-4 py-2.5 text-xs text-muted-foreground",
            COLUMNS,
          )}
        >
          <span>Recurso</span>
          <span>Módulo</span>
          <span>Duración</span>
          <span>Estado</span>
          <span />
        </div>
        {items.length === 0 && (
          <p className="px-4 py-8 text-center text-muted-foreground">
            Pega arriba un enlace a un curso, un vídeo o la documentación.
          </p>
        )}
        {items.map((item) => (
          <ResourceRow
            key={`${item.owner.path}-${item.index}`}
            item={item}
            onChange={(changes) => rumbo.learning.updateResource(item.owner, item.index, changes)}
            onRemove={() => rumbo.learning.removeResource(item.owner, item.index)}
          />
        ))}
      </Card>
    </div>
  );
}

interface ResourceRowProps {
  item: ResourceItem;
  onChange: (changes: Partial<Resource>) => void;
  onRemove: () => void;
}

function ResourceRow({ item, onChange, onRemove }: ResourceRowProps) {
  const { resource } = item;
  const skipped = resource.status === "skip";

  return (
    <div
      className={cn(
        "grid items-center gap-4 border-b px-4 py-3 last:border-b-0",
        COLUMNS,
        skipped && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <ResourceIcon kind={resource.kind} />
        <div className="min-w-0">
          <button
            type="button"
            disabled={!resource.url}
            onClick={() => resource.url && void openUrl(resource.url)}
            className="flex max-w-full items-center gap-1.5 text-left enabled:hover:underline"
          >
            <span className="truncate">{resource.title}</span>
            {resource.url && <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground" />}
          </button>
          {resource.source && (
            <div className="truncate text-xs text-muted-foreground">{resource.source}</div>
          )}
        </div>
      </div>
      <span className="truncate">{item.module ?? "Todos"}</span>
      <span className="font-mono text-xs text-muted-foreground">
        {resource.minutes ? formatMinutes(resource.minutes) : "—"}
      </span>
      <Tag dot className={RESOURCE_STATUS_STYLE[resource.status]}>
        {RESOURCE_STATUS_LABEL[resource.status]}
        {skipped && resource.why && ` · ${resource.why}`}
      </Tag>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Opciones de ${resource.title}`} />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onChange({ status: "pending", why: undefined })}>
              Pendiente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChange({ status: "doing", why: undefined })}>
              En curso
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChange({ status: "done", why: undefined })}>
              Visto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChange({ status: "skip", why: "ya lo domino" })}>
              Saltar: ya lo domino
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onChange({ status: "skip", why: "no aporta a mi objetivo" })}
            >
              Saltar: no aporta
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onRemove}>
            Quitar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Pegar un enlace basta; el título, la duración y el módulo se completan al pegarlo. */
function AddResourceForm({ topic }: { topic: TopicSummary }) {
  const rumbo = useRumbo();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  // null: el recurso es de todo el tema y se guarda en su nota.
  const [modulePath, setModulePath] = useState<string | null>(null);
  const guess = url.trim() ? guessFromUrl(url.trim()) : undefined;
  const modules = topic.roadmap?.modules ?? [];

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!url.trim() && !title.trim()) return;
    const owner = modules.find((module) => module.path === modulePath) ?? topic;
    await rumbo.learning.addResource(owner, {
      title: title.trim() || url.trim(),
      url: url.trim() || undefined,
      kind: guess?.kind ?? "article",
      source: guess?.source,
      minutes: Number(minutes) > 0 ? Number(minutes) : undefined,
      status: "pending",
    });
    setUrl("");
    setTitle("");
    setMinutes("");
  }

  return (
    <form onSubmit={add} className="flex flex-col gap-2">
      <div className="flex gap-3">
        <InputGroup className="h-11 flex-1">
          <InputGroupAddon>
            <LinkIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Pega un enlace: Platzi, Udemy, YouTube, Microsoft Learn, GitHub… y elige el tema"
            aria-label="Enlace del recurso"
          />
        </InputGroup>
        <Button type="submit" size="lg" className="h-11" disabled={!url.trim() && !title.trim()}>
          <PlusIcon data-icon="inline-start" />
          Añadir
        </Button>
      </div>
      {url.trim() && (
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={guess?.source ? `Título (${guess.source})` : "Título"}
            aria-label="Título del recurso"
          />
          <Input
            type="number"
            min={1}
            className="w-28"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            placeholder="minutos"
            aria-label="Minutos"
          />
          <div className="w-64 shrink-0">
            <OptionSelect
              options={[
                { label: "Todo el tema", value: null },
                ...modules.map((module) => ({ label: module.title, value: module.path })),
              ]}
              value={modulePath}
              onChange={setModulePath}
            />
          </div>
        </div>
      )}
    </form>
  );
}
