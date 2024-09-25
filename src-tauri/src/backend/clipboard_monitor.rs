use crate::backend::database::{save_clipboard_content, DB_CONNECTION};
use crate::backend::shared::SKIP_NEXT_SAVE;
use crate::fns::emit_clipboard_updated;
use clipboard::{ClipboardContext, ClipboardProvider};
use std::sync::atomic::Ordering;
use std::time::Duration;

pub async fn run_clipboard_monitor(app_handle: &tauri::AppHandle) {
    let mut last_clipboard_content = get_clipboard_content();
    std::thread::sleep(Duration::from_secs(1));

    loop {
        let current_content = get_clipboard_content();
        if !current_content.is_empty() && current_content != last_clipboard_content {
            if SKIP_NEXT_SAVE.load(Ordering::SeqCst) {
                SKIP_NEXT_SAVE.store(false, Ordering::SeqCst);
            } else {
                let conn = DB_CONNECTION.lock().unwrap();
                save_clipboard_content(&conn, &current_content).unwrap();
                emit_clipboard_updated(app_handle);
            }
            last_clipboard_content = current_content;
        }
        std::thread::sleep(Duration::from_secs(1));
    }
}

fn get_clipboard_content() -> String {
    let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
    ctx.get_contents().unwrap_or_else(|_| String::new())
}
