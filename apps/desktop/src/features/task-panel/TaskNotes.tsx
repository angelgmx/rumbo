/** La descripción de la tarea: un bloque de escritura que crece con el texto; los enlaces salen también en Recursos. */
export function TaskNotes({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (notes: string) => void;
  onBlur?: () => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      placeholder="Añade contexto, enlaces o notas…"
      aria-label="Descripción"
      className="field-sizing-content min-h-28 w-full resize-none rounded-lg border border-transparent bg-muted/50 px-3 py-2.5 text-sm leading-6 transition-colors duration-(--dur-fast) outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}
