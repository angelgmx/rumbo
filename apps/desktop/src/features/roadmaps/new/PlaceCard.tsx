import type { TopicOption } from "@rumbo/core";
import { FolderIcon } from "lucide-react";
import { OptionSelect } from "@/components/OptionSelect";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PlaceChoice } from "./place";

/** Dónde va la ruta: un tema que aún no tiene ruta, o un tema nuevo dentro de un área. */
export function PlaceCard({
  topics,
  value,
  onChange,
}: {
  topics: TopicOption[];
  value: PlaceChoice;
  onChange: (choice: PlaceChoice) => void;
}) {
  const free = topics.filter((topic) => !topic.hasRoadmap);

  return (
    <Card className="gap-3 p-5">
      <h2 className="flex items-center gap-2 font-medium">
        <FolderIcon className="size-4 text-muted-foreground" />
        Dónde va
      </h2>
      <OptionSelect
        options={[
          { label: "Tema nuevo", value: null },
          ...free.map((topic) => ({ label: topic.name, value: topic.path })),
        ]}
        value={value.topicPath}
        onChange={(topicPath) => onChange({ ...value, topicPath })}
      />
      {value.topicPath === null && (
        <>
          <Input
            value={value.newName}
            onChange={(event) => onChange({ ...value, newName: event.target.value })}
            placeholder="Nombre del tema"
            aria-label="Nombre del tema nuevo"
          />
          <OptionSelect
            options={[
              { label: "Sin área", value: null },
              ...topics.map((topic) => ({ label: `Dentro de ${topic.name}`, value: topic.path })),
            ]}
            value={value.parentPath}
            onChange={(parentPath) => onChange({ ...value, parentPath })}
          />
        </>
      )}
      <p className="text-xs text-muted-foreground">
        Cada tema tiene una ruta; los que ya tienen no salen aquí.
      </p>
    </Card>
  );
}
