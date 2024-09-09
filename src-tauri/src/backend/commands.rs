use crate::backend::database::{get_clipboard_history, DB_CONNECTION};
use crate::backend::shared::SKIP_NEXT_SAVE;
use serde::Serialize;
use chrono::{DateTime, Local};
use std::sync::atomic::Ordering;

// Create a global instance of SharedState
// static SHARED_STATE: Lazy<Arc<SharedState>> = Lazy::new(|| {
//     Arc::new(SharedState::new())
// });

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
        },
        Err(e) => {
            Err(format!("Failed to fetch clipboard history: {}", e))
        },
    }
}

#[tauri::command]
pub fn clear_clipboard_history() -> Result<(), String> {
    let conn = DB_CONNECTION.lock().unwrap();
    let mut attempts = 0;
    const MAX_ATTEMPTS: usize = 5;

    while attempts < MAX_ATTEMPTS {
        match conn.execute("DELETE FROM clipboard", []) {
            Ok(_) => {
                println!("Deleted all the entries from database");
                return Ok(())
            },
            Err(e) => {
                if e.to_string().contains("DatabaseBusy") {
                    attempts += 1;
                    std::thread::sleep(std::time::Duration::from_millis(100)); // Wait before retrying
                } else {
                    return Err(format!("Failed to clear clipboard history: {}", e));
                }
            }
        }
    }
    Err("Failed to clear clipboard history after multiple attempts".to_string())
}

#[tauri::command]
pub fn mark_user_copy() -> Result<(), String> {
    SKIP_NEXT_SAVE.store(true, Ordering::SeqCst);
    Ok(())
}