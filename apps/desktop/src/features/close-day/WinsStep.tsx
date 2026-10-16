import { CheckCircle2Icon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "./StepCard";

/** Paso 3: lo que salió bien. Lo propone Rumbo con tus datos y lo puedes cambiar. */
export function WinsStep({
  wins,
  onChange,
}: {
  wins: string[];
  onChange: (wins: string[]) => void;
}) {
  const edit = (index: number, text: string) =>
    onChange(wins.map((win, i) => (i === index ? text : win)));
  const remove = (index: number) => onChange(wins.filter((_, i) => i !== index));

  return (
    <StepCard
      number={3}
      title="Lo que hiciste bien"
      aside="Lo escribe Rumbo con tus datos · editable"
    >
      <ul className="flex flex-col gap-1">
        {wins.map((win, index) => (
          <li key={index} className="group flex items-center gap-3">
            <CheckCircle2Icon className="size-4 shrink-0 text-success" />
            <input
              value={win}
              onChange={(event) => edit(index, event.target.value)}
              aria-label={`Lo que salió bien ${index + 1}`}
              className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 outline-none focus-visible:bg-muted"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Quitar"
              onClick={() => remove(index)}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <XIcon />
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" className="self-start" onClick={() => onChange([...wins, ""])}>
        <PlusIcon data-icon="inline-start" />
        Añadir otra
      </Button>
    </StepCard>
  );
}
