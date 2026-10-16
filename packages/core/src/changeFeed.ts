type Listener = () => void;

/** Avisa a quien escuche (la UI) cada vez que cambia algo, en el vault o en la base de datos. */
export class ChangeFeed {
  private readonly listeners = new Set<Listener>();
  private changes = 0;

  /** Sube con cada cambio. La UI lo usa para saber cuándo repintar. */
  get version(): number {
    return this.changes;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void {
    this.changes++;
    for (const listener of this.listeners) listener();
  }
}
