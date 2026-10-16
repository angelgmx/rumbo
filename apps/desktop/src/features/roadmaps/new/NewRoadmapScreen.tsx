import { draftProblems, emptyModule, type RoadmapDraft } from "@rumbo/core";
import { BotIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { roadmapHref } from "../links";
import { ChangeRequest } from "./ChangeRequest";
import { DraftEditor } from "./DraftEditor";
import { initialPlace, toRoadmapPlace, type PlaceChoice } from "./place";
import { PlaceCard } from "./PlaceCard";
import { StartChooser } from "./StartChooser";
import { useNewRoadmap } from "./useNewRoadmap";
import { VaultPreview } from "./VaultPreview";

const BLANK: RoadmapDraft = { title: "", modules: [emptyModule()] };

/** Nueva ruta: se empieza con la IA o en blanco y se revisa entera antes de crearla. */
export function NewRoadmapScreen() {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const roadmap = useNewRoadmap();
  const [topics] = useState(() => rumbo.newRoadmap.topics());
  const [choice, setChoice] = useState<PlaceChoice>();
  const draft = roadmap.draft;
  const place = useMemo(() => choice && toRoadmapPlace(choice), [choice]);

  function start(next: RoadmapDraft) {
    roadmap.setDraft(next);
    setChoice(initialPlace(next, topics));
  }

  async function create() {
    if (!draft || !place) return;
    try {
      const { topic } = await rumbo.newRoadmap.create(draft, place);
      toast.success(`Ruta «${draft.title.trim()}» creada`);
      navigate(roadmapHref(topic));
    } catch {
      toast.error("No se ha podido crear la ruta");
    }
  }

  const problems = draft ? draftProblems(draft) : [];
  if (draft && !place) problems.push("Elige dónde va");

  return (
    <>
      <ScreenHeader
        newTask={false}
        title={
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Link href="/roadmaps" className="hover:text-foreground">
              Roadmaps
            </Link>
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">Nueva ruta</span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" render={<Link href="/roadmaps" />}>
              Cancelar
            </Button>
            {draft && (
              <Button onClick={create} disabled={problems.length > 0} title={problems.join(" · ")}>
                <CheckIcon data-icon="inline-start" />
                Crear ruta
              </Button>
            )}
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="mt-1"
              aria-label="Volver"
              render={<Link href="/roadmaps" />}
            >
              <ChevronLeftIcon />
            </Button>
            <div className="min-w-0 flex-1">
              {draft ? (
                <input
                  value={draft.title}
                  onChange={(event) => roadmap.setDraft({ ...draft, title: event.target.value })}
                  placeholder="Nombre de la ruta"
                  aria-label="Nombre de la ruta"
                  className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-faint"
                />
              ) : (
                <h1 className="text-3xl font-semibold tracking-tight">Nueva ruta</h1>
              )}
              <p className="mt-1 text-muted-foreground">
                {draft
                  ? "Revísala y cámbiala antes de crearla"
                  : "Qué quieres aprender o conseguir, paso a paso"}
              </p>
            </div>
            {draft && (
              <span className="rounded-md border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs text-warning">
                Vista previa
              </span>
            )}
          </div>

          {!draft || !choice ? (
            <StartChooser
              aiReady={roadmap.aiReady}
              thinking={roadmap.thinking}
              onPropose={async (wish) => {
                const proposed = await roadmap.propose(wish);
                if (proposed) setChoice(initialPlace(proposed, topics));
              }}
              onBlank={() => start(BLANK)}
            />
          ) : (
            <div className="grid grid-cols-[1fr_22rem] items-start gap-5">
              <div className="flex flex-col gap-3">
                <DraftEditor draft={draft} onChange={roadmap.setDraft} />
                {roadmap.aiReady && (
                  <ChangeRequest thinking={roadmap.thinking} onRequest={roadmap.revise} />
                )}
              </div>
              <div className="flex flex-col gap-4">
                {draft.reason && (
                  <Card className="gap-2 p-5">
                    <h2 className="flex items-center gap-2 font-medium">
                      <BotIcon className="size-4 text-muted-foreground" />
                      Por qué este orden
                    </h2>
                    <p className="text-sm text-muted-foreground">{draft.reason}</p>
                  </Card>
                )}
                <PlaceCard topics={topics} value={choice} onChange={setChoice} />
                <VaultPreview draft={draft} place={place} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
