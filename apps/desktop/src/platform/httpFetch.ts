// El fetch de Tauri sale desde la parte nativa: sin las limitaciones de CORS del WebView.
export { fetch as httpFetch } from "@tauri-apps/plugin-http";
