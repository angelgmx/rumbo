// El esquema de la base de datos, por versiones. Está en castellano para que cualquiera que
// la abra entienda qué guarda (ver docs/modelo-de-datos.md). Una versión publicada no se
// cambia nunca: los cambios van en una nueva, así toda base de datos sube paso a paso.
export const MIGRATIONS: string[][] = [
  [
    `CREATE TABLE ajustes (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    )`,
    `CREATE TABLE ideas (
      id INTEGER PRIMARY KEY,
      texto TEXT NOT NULL CHECK (length(trim(texto)) > 0),
      creada TEXT NOT NULL
    )`,
  ],
];
