// La clave de la IA vive en el llavero del sistema: nunca en el vault ni en los ajustes de la app.

use keyring::{Entry, Error};

const SERVICE: &str = "rumbo";
const ACCOUNT: &str = "ai-api-key";

fn entry() -> Result<Entry, String> {
    Entry::new(SERVICE, ACCOUNT).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn ai_key_get() -> Result<Option<String>, String> {
    match entry()?.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(Error::NoEntry) => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

/// Guarda la clave; vacía, la borra.
#[tauri::command]
pub fn ai_key_set(key: String) -> Result<(), String> {
    let entry = entry()?;
    let result = if key.is_empty() {
        entry.delete_credential()
    } else {
        entry.set_password(&key)
    };
    match result {
        Ok(()) | Err(Error::NoEntry) => Ok(()),
        Err(error) => Err(error.to_string()),
    }
}
