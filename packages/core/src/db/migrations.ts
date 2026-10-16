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
  [
    // La clave es fija: la usan las tareas y las rutas del vault para señalar el hábito.
    // La frecuencia va en JSON: "diaria", ["lun", "mie"] o {"veces_por_semana": 3}.
    `CREATE TABLE habitos (
      id INTEGER PRIMARY KEY,
      clave TEXT NOT NULL UNIQUE CHECK (length(trim(clave)) > 0),
      nombre TEXT NOT NULL CHECK (length(trim(nombre)) > 0),
      tipo TEXT NOT NULL DEFAULT 'si_no' CHECK (tipo IN ('si_no', 'cantidad', 'duracion', 'tareas')),
      meta REAL CHECK (meta > 0),
      minimo REAL CHECK (minimo > 0),
      unidad TEXT,
      frecuencia TEXT NOT NULL DEFAULT '"diaria"' CHECK (json_valid(frecuencia)),
      area TEXT,
      objetivo TEXT,
      hora_inicio TEXT,
      hora_fin TEXT,
      empezado TEXT,
      hasta TEXT,
      archivado INTEGER NOT NULL DEFAULT 0 CHECK (archivado IN (0, 1)),
      creado TEXT NOT NULL
    )`,
    // Un registro por hábito y día, solo si se hizo algo: en los de sí o no, el valor es 1.
    `CREATE TABLE registros_habito (
      habito_id INTEGER NOT NULL REFERENCES habitos (id) ON DELETE CASCADE,
      dia TEXT NOT NULL,
      valor REAL NOT NULL CHECK (valor > 0),
      PRIMARY KEY (habito_id, dia)
    )`,
  ],
];
