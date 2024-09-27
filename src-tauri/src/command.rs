use std::sync::Once;

use tauri::Manager;
use tauri_nspanel::ManagerExt;

use crate::fns::{
    emit_settings_window_open, setup_menubar_panel_listeners, swizzle_to_menubar_panel, update_menubar_appearance
};

static INIT: Once = Once::new();

#[tauri::command]
pub fn init(app_handle: tauri::AppHandle) {
    INIT.call_once(|| {
        swizzle_to_menubar_panel(&app_handle);

        update_menubar_appearance(&app_handle);

        setup_menubar_panel_listeners(&app_handle);
    });
}

#[tauri::command]
pub fn show_menubar_panel(app_handle: tauri::AppHandle) {
    let panel = app_handle.get_webview_panel("main").unwrap();

    panel.show();
}

#[tauri::command]
pub fn open_settings(app_handle: tauri::AppHandle) {
    let settings_window = app_handle.get_webview_window("settings").unwrap();

    // Set the window to be always on top
    // settings_window.set_always_on_top(true).unwrap();

    // Show the window and focus it
    settings_window.show().unwrap();
    settings_window.set_focus().unwrap(); // Focus the window
    emit_settings_window_open(&app_handle);
}

#[tauri::command]
pub fn close_settings(app_handle: tauri::AppHandle) {
    let settings_window = app_handle.get_webview_window("settings").unwrap();
    settings_window.hide().unwrap(); // Use hide() to close the window
}

#[tauri::command]
pub fn close_panel(app_handle: tauri::AppHandle) {
    let main_window = app_handle.get_webview_window("main").unwrap();
    main_window.hide().unwrap(); // Use hide() to close the window
}
