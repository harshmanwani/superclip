// use tauri::Manager;
use crate::backend::database::{get_clipboard_history, initialize_database};

#[tauri::command]
pub fn fetch_clipboard_history() -> Result<Vec<String>, String> {
    match initialize_database() {
        Ok(client) => match get_clipboard_history(&client, 10) {
            Ok(history) => Ok(history),
            Err(e) => Err(format!("Failed to fetch clipboard history: {}", e)),
        },
        Err(e) => Err(format!("Failed to initialize database: {}", e)),
    }
}