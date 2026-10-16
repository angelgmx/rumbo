import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { AddAction, GoalSection } from "./GoalSection";

/** El porqué, texto libre escrito en su sitio: se guarda al salir del campo. */
export function GoalWhy({ why, onSave }: { why: string; onSave: (why: string) => void }) {
  const [text, setText] = useState(why);
  const [writing, setWriting] = useState(false);

  if (!why && !writing) {
    return <GoalSection title="Por qué" action={<AddAction onClick={() => setWriting(true)} />} />;
  }

  return (
    <GoalSection title="Por qué">
      <Textarea
        autoFocus={writing}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => {
          setWriting(false);
          if (text !== why) onSave(text);
        }}
        placeholder="Por qué te importa este objetivo"
        aria-label="Por qué te importa"
        className="min-h-12 resize-none border-transparent bg-transparent px-2 hover:bg-muted/40 dark:bg-transparent"
      />
    </GoalSection>
  );
}
