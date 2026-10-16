# 0002. El vault de Markdown es la única fuente de verdad

- **Estado:** sustituido en parte por la [0013](0013-organizacion-en-sqlite-conocimiento-en-el-vault.md): el vault guarda el conocimiento y el diario; la organización va en SQLite
- **Contexto:** las notas tienen que poder leerse en Obsidian sin la app, y no puede haber dependencia de un formato cerrado.
- **Decisión:** todos los datos son notas `.md` con frontmatter YAML. Cualquier índice o caché es derivado y se puede borrar.
- **Consecuencias:** las consultas son más lentas que con SQL (se resuelve con un índice en memoria). A cambio, los datos son portables y se sincronizan gratis con git, Syncthing u Obsidian Sync.
