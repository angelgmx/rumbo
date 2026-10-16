# 0014. La base de datos dentro del vault

- **Estado:** aceptado · cambia el sitio de la base de datos de la [0013](0013-organizacion-en-sqlite-conocimiento-en-el-vault.md)
- **Contexto:** en la carpeta de datos de la app, la base de datos no entra en las copias del vault y se pierde al reinstalar o al cambiar de equipo. La organización (tareas, objetivos, hábitos…) vale tanto como el conocimiento.
- **Decisión:** `rumbo.db` va en `.rumbo/` dentro del vault, junto a `config.yml`. Una conexión por vault.
- **Consecuencias:**
  - El vault entero (notas + base de datos) es tu copia de seguridad: si la app desaparece, tus datos siguen ahí.
  - Obsidian no la enseña ni la sincroniza (es una carpeta oculta). Si sincronizas el vault con otra herramienta (git, Syncthing), no abras Rumbo en dos equipos a la vez: SQLite no se lleva bien con dos escritores.
  - Para sacar la organización a Markdown o CSV habrá un botón de exportar (fase de lanzamiento).
