/** Por qué ha fallado la IA, para decírselo al usuario con palabras suyas. */
export type AiFailure = "unreachable" | "unauthorized" | "not-found" | "rate-limited" | "failed";

export class AiError extends Error {
  constructor(
    readonly failure: AiFailure,
    message: string,
  ) {
    super(message);
    this.name = "AiError";
  }
}
