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
  [
    // El aspecto propio del hábito: un icono de Lucide ("dumbbell") y un color ("#34C38F").
    // Si no tiene, se usan los de su área.
    "ALTER TABLE habitos ADD COLUMN icono TEXT",
    "ALTER TABLE habitos ADD COLUMN color TEXT",
  ],
  [
    // Los bloques van dentro de la rutina, en JSON y en orden: siempre se guardan con ella,
    // así moverlos o cambiarlos es una sola escritura. Cada bloque:
    //   {"tipo": "habito", "habito": "ingles", "minutos": 15}
    //   {"tipo": "tema", "tema": "[[Java desde cero]]", "minutos": 45}
    //   {"tipo": "descanso", "minutos": 10}
    //   {"tipo": "libre" | "tarea", "titulo": "Repaso", "minutos": 15}
    `CREATE TABLE rutinas (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL CHECK (length(trim(nombre)) > 0),
      tipo TEXT NOT NULL DEFAULT 'libre'
        CHECK (tipo IN ('manana', 'tarde', 'noche', 'estudio', 'gym', 'libre')),
      dias TEXT NOT NULL DEFAULT '"diaria"' CHECK (json_valid(dias)),
      hora_inicio TEXT NOT NULL,
      area TEXT,
      activa INTEGER NOT NULL DEFAULT 1 CHECK (activa IN (0, 1)),
      bloques TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(bloques)),
      creada TEXT NOT NULL
    )`,
  ],
  [
    // Un objetivo con sus resultados clave, planes «si… entonces» y recursos dentro:
    //   resultados_clave: [{"nombre": "Sesiones", "desde": 6, "hasta": 80, "unidad": "sesiones", "actual": 12}]
    //   planes:   [{"si": "me da vergüenza", "entonces": "reservo 3 clases el domingo"}]
    //   recursos: [{"titulo": "Método Nation", "url": "https://…", "tipo": "articulo"}]
    `CREATE TABLE objetivos (
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
      area TEXT,
      por_que TEXT NOT NULL DEFAULT '',
      horizonte TEXT CHECK (horizonte IN ('anio', 'trimestre')),
      periodo TEXT,
      inicio TEXT,
      fecha_limite TEXT,
      estado TEXT NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('sin_empezar', 'activo', 'pausado', 'hecho', 'abandonado', 'fallido')),
      resultados_clave TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(resultados_clave)),
      obstaculo TEXT NOT NULL DEFAULT '',
      planes TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(planes)),
      recursos TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(recursos)),
      creado TEXT NOT NULL
    )`,
    // Las rutas y las notas que lo acompañan viven en el vault: se señalan por el nombre de su nota.
    `CREATE TABLE objetivo_notas (
      objetivo_id INTEGER NOT NULL REFERENCES objetivos (id) ON DELETE CASCADE,
      nota TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('ruta', 'nota')),
      PRIMARY KEY (objetivo_id, nota)
    )`,
    // Un proyecto con sus hitos y enlaces dentro:
    //   hitos:   [{"titulo": "Landing", "fecha": "2026-11-30", "hecho": false}]
    //   enlaces: [{"titulo": "Repo", "url": "https://github.com/…"}]
    `CREATE TABLE proyectos (
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
      resultado TEXT NOT NULL DEFAULT '',
      area TEXT,
      objetivo_id INTEGER REFERENCES objetivos (id) ON DELETE SET NULL,
      estado TEXT NOT NULL DEFAULT 'idea'
        CHECK (estado IN ('idea', 'en_marcha', 'bloqueado', 'hecho')),
      inicio TEXT,
      fecha_limite TEXT,
      terminado TEXT,
      enlaces TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(enlaces)),
      hitos TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(hitos)),
      archivado INTEGER NOT NULL DEFAULT 0 CHECK (archivado IN (0, 1)),
      creado TEXT NOT NULL
    )`,
    // Los hábitos y las tareas pasan a señalar su objetivo y su proyecto por id. Las columnas
    // de texto de antes (`habitos.objetivo`, `tareas.proyecto`) solo guardan el nombre de la
    // nota hasta que se importa; al importar se enlazan y se vacían.
    "ALTER TABLE habitos ADD COLUMN objetivo_id INTEGER REFERENCES objetivos (id) ON DELETE SET NULL",
    "ALTER TABLE tareas ADD COLUMN proyecto_id INTEGER REFERENCES proyectos (id) ON DELETE SET NULL",
    // Una tarea suelta también puede empujar un objetivo, sin pasar por un proyecto.
    "ALTER TABLE tareas ADD COLUMN objetivo_id INTEGER REFERENCES objetivos (id) ON DELETE SET NULL",
  ],
  [
    // La hora a la que toca una tarea el día en que está programada ("18:00").
    "ALTER TABLE tareas ADD COLUMN hora TEXT",
    // Lo que la IA ha hecho con una tarea suelta y qué pasó después. `antes` y `despues` guardan
    // solo los campos que tocó, con los nombres de los campos de la tarea, para poder devolverlos
    // a como estaban:
    //   antes:   {"steps": [], "priority": null, "scheduled": null, "time": null}
    //   despues: {"steps": [{"text": "Buscar precios", "done": false}], "priority": "high", …}
    // Una descartada o revertida no vuelve a proponerse; no lleva ni antes ni después.
    `CREATE TABLE organizaciones_tarea (
      id INTEGER PRIMARY KEY,
      tarea_id INTEGER NOT NULL REFERENCES tareas (id) ON DELETE CASCADE,
      estado TEXT NOT NULL CHECK (estado IN ('aplicada', 'revertida', 'descartada')),
      antes TEXT CHECK (antes IS NULL OR json_valid(antes)),
      despues TEXT CHECK (despues IS NULL OR json_valid(despues)),
      creada TEXT NOT NULL
    )`,
    "CREATE INDEX organizaciones_tarea_por_tarea ON organizaciones_tarea (tarea_id, estado)",
  ],
  [
    // Una rutina puede tener vigencia (pasado `vigente_hasta` deja de tocar), empujar un
    // objetivo y marcar un hábito, que se señala por su clave.
    "ALTER TABLE rutinas ADD COLUMN vigente_desde TEXT",
    "ALTER TABLE rutinas ADD COLUMN vigente_hasta TEXT",
    "ALTER TABLE rutinas ADD COLUMN objetivo_id INTEGER REFERENCES objetivos (id) ON DELETE SET NULL",
    "ALTER TABLE rutinas ADD COLUMN habito TEXT",
  ],
  [
    // Los bloques «libre» pasan a «actividad» y los de «tarea» sin tarea elegida también: solo
    // tenían título y minutos. Desde ahora un bloque de tarea apunta a una tarea por su id:
    //   {"tipo": "tarea", "tarea": "12", "minutos": 20}
    //   {"tipo": "actividad", "titulo": "Café", "minutos": 10}
    `UPDATE rutinas SET bloques = (
      SELECT json_group_array(json(
        CASE WHEN json_extract(value, '$.tipo') IN ('libre', 'tarea')
          THEN json_set(value, '$.tipo', 'actividad')
          ELSE value
        END))
      FROM (SELECT value FROM json_each(rutinas.bloques) ORDER BY key)
    )
    WHERE EXISTS (
      SELECT 1 FROM json_each(rutinas.bloques) WHERE json_extract(value, '$.tipo') IN ('libre', 'tarea')
    )`,
  ],
];
