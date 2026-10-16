/** Las notas de la tarea: texto libre de varias líneas. */
export function TaskNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (notes: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Notas</h3>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Añade notas, un enlace o pega texto…"
        aria-label="Notas"
        className="field-sizing-content min-h-16 resize-none rounded-md bg-transparent px-2 -mx-2 py-1.5 outline-none placeholder:text-muted-foreground/60 hover:bg-muted/50 focus:bg-muted/50"
      />
    </section>
  );
}
