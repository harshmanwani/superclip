// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod command;
mod fns;
mod tray;
// mod platform;
mod backend {
    pub mod clipboard_monitor;
    pub mod commands;
    pub mod database;
}

use backend::{clipboard_monitor::run_clipboard_monitor, database::DB_CONNECTION};
use futures::executor::block_on; // Added this line to import the futures crate
use once_cell::sync::Lazy; // Added this line to import Lazy

use tauri::Manager;
// use crate::database::TursoClient;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            command::init,
            command::show_menubar_panel,
            backend::commands::fetch_clipboard_history,
            backend::commands::clear_clipboard_history
        ])
        .plugin(tauri_nspanel::init())
        .setup(|app| {
            // Initialize the database connection
            Lazy::force(&DB_CONNECTION);

            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // let client = initialize_database().expect("Failed to initialize database");
            let app_handle = app.app_handle();

            tray::create(app_handle)?;

            // Start the clipboard monitor
            let app_handle_clone = app_handle.clone();
            std::thread::spawn(move || {
                block_on(run_clipboard_monitor(&app_handle_clone));
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
