/** La descripción de la tarea: texto libre, de varias líneas; los enlaces salen también en Recursos. */
export function TaskNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (notes: string) => void;
}) {
  return (
    <textarea
      rows={3}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Añade contexto, un enlace o pega texto…"
      aria-label="Descripción"
      className="field-sizing-content min-h-20 w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground/50"
    />
  );
}
