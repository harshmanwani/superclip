// use tauri::Manager;
use crate::backend::database::{get_clipboard_history, initialize_database};
use serde::Serialize;
use chrono::{DateTime, Local};

#[derive(Serialize, Debug)]
pub struct ClipboardEntry {
    content: String,
    timestamp: String,
}

#[tauri::command]
pub fn fetch_clipboard_history() -> Result<Vec<ClipboardEntry>, String> {
    match initialize_database() {
        Ok(client) => {
            println!("Database initialized successfully");
            match get_clipboard_history(&client, 100) {
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
                    println!("Error fetching clipboard history: {}", e);
                    Err(format!("Failed to fetch clipboard history: {}", e))
                },
            }
        },
        Err(e) => {
            println!("Error initializing database: {}", e);
            Err(format!("Failed to initialize database: {}", e))
        },
    }
}