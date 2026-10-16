# 0012. IA detrás de un puerto: Claude y proveedores compatibles con OpenAI

- **Estado:** aceptado
- **Contexto:** la IA estaba en la Fase 7, pero organizar el Inbox la necesita antes. Hay que poder usar un modelo local (Ollama) o uno en la nube (Groq, Gemini, OpenAI) sin atar `core` a ninguno, y sin que la clave acabe en el vault.
- **Decisión:**
  - `core` define el puerto `AiProvider` (`complete(mensajes)`) y no sabe qué modelo hay detrás.
  - Dos adaptadores: `anthropic` (Claude, el proveedor por defecto) y `openAiCompatible`, que habla con cualquier API compatible con la de OpenAI (`/chat/completions`): Ollama, LM Studio, Groq, Gemini…
  - Los adaptadores viven en `core/src/ai` y no en la app: reciben `fetch` desde fuera, no importan Tauri y así se prueban sin red.
  - La app llama con el plugin `http` de Tauri (sin CORS) y solo a la URL que pone el usuario.
  - Proveedor, URL y modelo son ajustes de esta instalación (`settings.json` de la app), no del vault: cambian de un equipo a otro.
  - La clave va al llavero del sistema (crate `keyring`). Nunca se escribe en el vault ni en los ajustes.
  - La IA propone y el usuario decide: nada se escribe en el vault sin una vista previa antes.
- **Consecuencias:** dos adaptadores cubren Claude, la nube y lo local. La app funciona igual sin IA.
