import { useState } from "react";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { Textarea } from "@/components/ui/textarea";

/** El porqué, escrito en su sitio: se guarda al salir del campo. */
export function GoalWhy({ why, onSave }: { why: string; onSave: (why: string) => void }) {
  const [text, setText] = useState(why);

  return (
    <section className="flex flex-col gap-2">
      <SectionLabel>Por qué</SectionLabel>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => text !== why && onSave(text)}
        placeholder="Por qué te importa este objetivo"
        aria-label="Por qué te importa"
        className="min-h-12 resize-none border-transparent bg-transparent px-2 hover:bg-muted/40 dark:bg-transparent"
      />
    </section>
  );
}
