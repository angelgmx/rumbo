/** Las notas de la tarea, bajo el título: texto libre; los enlaces salen también en Recursos. */
export function TaskNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (notes: string) => void;
}) {
  return (
    <textarea
      rows={1}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Añade notas, un enlace o pega texto…"
      aria-label="Notas"
      className="field-sizing-content min-h-6 w-full resize-none bg-transparent pl-8 text-sm leading-6 text-muted-foreground outline-none placeholder:text-muted-foreground/50 focus:text-foreground"
    />
  );
}
