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
  [
    // Una fila por tarea, con sus pasos y etiquetas en JSON: cada cambio es una sola
    // escritura y la tarea nunca queda a medias.
    `CREATE TABLE tareas (
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
      estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_curso', 'hecha', 'cancelada')),
      notas TEXT NOT NULL DEFAULT '',
      pasos TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(pasos)),
      etiquetas TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(etiquetas)),
      prioridad TEXT CHECK (prioridad IN ('alta', 'media', 'baja')),
      programada TEXT,
      vence TEXT,
      repeticion TEXT,
      duracion_min INTEGER CHECK (duracion_min > 0),
      minutos_trabajados REAL NOT NULL DEFAULT 0 CHECK (minutos_trabajados >= 0),
      area TEXT,
      proyecto TEXT,
      modulo TEXT,
      habito TEXT,
      en_foco_el TEXT,
      archivada INTEGER NOT NULL DEFAULT 0 CHECK (archivada IN (0, 1)),
      creada TEXT NOT NULL,
      hecha_el TEXT
    )`,
    "CREATE INDEX tareas_por_fecha ON tareas (estado, programada, vence)",
  ],
];
