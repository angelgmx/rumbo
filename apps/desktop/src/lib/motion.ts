// Los mismos tiempos y curvas que las variables CSS de index.css (nota 13 del plan),
// para que lo que anima CSS y lo que anima motion se sienta igual.
export const duration = {
  instant: 0.08,
  fast: 0.12,
  base: 0.18,
  slow: 0.26,
} as const;

export const ease = {
  enter: [0.2, 0.8, 0.2, 1],
  exit: [0.4, 0, 1, 1],
  emphasis: [0.32, 0.72, 0, 1],
} as const;

/** Para filas de listas: entran bajando un poco y salen plegándose. */
export const listItem = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.enter } },
  exit: { opacity: 0, height: 0, transition: { duration: duration.base * 0.7, ease: ease.exit } },
} as const;
