use libsql_client::Client as TursoClient;
use rusqlite::{Connection, Result};
use std::time::Duration;
use std::path::PathBuf;
use directories::ProjectDirs;
use crate::backend::database::{save_clipboard_content};
use clipboard::{ClipboardContext, ClipboardProvider};
use tauri::Manager;
use crate::fns::emit_clipboard_updated;
use crate::backend::database::DB_CONNECTION;

pub async fn run_clipboard_monitor(app_handle: &tauri::AppHandle) {
    let mut last_clipboard_content = get_clipboard_content();

    // Add a small delay before starting the monitor
    std::thread::sleep(Duration::from_secs(1));

    loop {
        let current_content = get_clipboard_content();
        if !current_content.is_empty() && current_content != last_clipboard_content {
            let conn = DB_CONNECTION.lock().unwrap();
            save_clipboard_content(&conn, &current_content).unwrap();
            last_clipboard_content = current_content;
            
            // Emit the clipboard-updated event
            emit_clipboard_updated(app_handle);
        }
        std::thread::sleep(Duration::from_secs(1));
    }
}

fn get_clipboard_content() -> String {
    let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
    ctx.get_contents().unwrap_or_else(|_| String::new())
}
