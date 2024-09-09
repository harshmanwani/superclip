use crate::backend::database::{get_clipboard_history, DB_CONNECTION};
use serde::Serialize;
use chrono::{DateTime, Local};

#[derive(Serialize, Debug)]
pub struct ClipboardEntry {
    content: String,
    timestamp: String,
}

#[tauri::command]
pub fn fetch_clipboard_history() -> Result<Vec<ClipboardEntry>, String> {
    let conn = DB_CONNECTION.lock().unwrap();
    match get_clipboard_history(&conn, 100) {
        Ok(history) => {
             println!("Retrieved {} entries from database", history.len());
                    let entries: Vec<ClipboardEntry> = history.into_iter()
                        .map(|(content, datetime): (String, DateTime<Local>)| {
                            ClipboardEntry { 
                                content, 
                                timestamp: datetime.to_rfc3339()
                            }
                        })
                        .collect();
                    println!("Converted {} entries to ClipboardEntry", entries.len());
                    Ok(entries)
            // ... rest of the function ...
        },
        Err(e) => {
            Err(format!("Failed to fetch clipboard history: {}", e))
        },
    }
}