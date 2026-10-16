import { BotIcon, LoaderCircleIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

/** Cómo empezar la ruta: que la proponga la IA a partir de lo que quieres, o en blanco. */
export function StartChooser({
  aiReady,
  thinking,
  onPropose,
  onBlank,
}: {
  aiReady: boolean;
  thinking: boolean;
  onPropose: (wish: string) => void;
  onBlank: () => void;
}) {
  const [wish, setWish] = useState("");

  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-4">
      <Card className="gap-4 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BotIcon className="size-5 text-primary-text" />
          Con IA
        </h2>
        <p className="text-sm text-muted-foreground">
          Escribe qué quieres aprender o conseguir. La IA propone los módulos en orden y tú la
          revisas antes de crear nada.
        </p>
        <Textarea
          value={wish}
          onChange={(event) => setWish(event.target.value)}
          placeholder="Por ejemplo: backend con Node.js; ya sé Java y tengo 2 h al día"
          aria-label="Qué quieres aprender o hacer"
          className="min-h-28"
        />
        {aiReady ? (
          <Button
            className="self-start"
            disabled={!wish.trim() || thinking}
            onClick={() => onPropose(wish)}
          >
            {thinking ? (
              <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
            ) : (
              <BotIcon data-icon="inline-start" />
            )}
            {thinking ? "Pensando…" : "Proponer ruta"}
          </Button>
        ) : (
          <Button variant="outline" className="self-start" render={<Link href="/ajustes/ia" />}>
            Configura la IA en Ajustes
          </Button>
        )}
      </Card>

      <Card className="gap-4 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <PencilIcon className="size-5 text-muted-foreground" />A mano
        </h2>
        <p className="text-sm text-muted-foreground">
          Pones tú el nombre y los módulos, con sus conceptos y cómo sabrás que los dominas.
        </p>
        <Button variant="outline" className="mt-auto self-start" onClick={onBlank}>
          Empezar en blanco
        </Button>
      </Card>
    </div>
  );
}
