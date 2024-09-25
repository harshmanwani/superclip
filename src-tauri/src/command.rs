use std::sync::Once;

use tauri::Manager;
use tauri_nspanel::ManagerExt;

use crate::fns::{
    setup_menubar_panel_listeners, swizzle_to_menubar_panel, update_menubar_appearance,
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
}

#[tauri::command]
pub fn close_settings(app_handle: tauri::AppHandle) {
    let settings_window = app_handle.get_webview_window("settings").unwrap();
    settings_window.hide().unwrap(); // Use hide() to close the window
}

use reqwest::Client;
use serde_json::json;

#[tauri::command]
pub async fn check_auth_status() -> Result<Option<serde_json::Value>, String> {
    // Implement logic to check if the user is authenticated
    // This might involve checking a stored token or making an API call
    Ok(None) // Return None if not authenticated
}

#[tauri::command]
pub async fn handle_auth_callback(code: String) -> Result<serde_json::Value, String> {
    let client = Client::new();
    let token_url = "https://dev-vd0xcbf5cr3qnwhb.us.auth0.com/oauth/token";

    let params = json!({
        "grant_type": "authorization_code",
        "client_id": "zmJ0KKnHViwP59YqevliutRyjYKFA6MH",
        "client_secret": "YOUR_CLIENT_SECRET",
        "code": code,
        "redirect_uri": "http://localhost:1420/callback"
    });

    let res = client
        .post(token_url)
        .json(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let token_data: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    // Store the token securely (implement this part)
    // Then fetch user info using the access token

    Ok(token_data)
}

#[tauri::command]
pub async fn logout() -> Result<(), String> {
    // Implement logout logic (clear stored tokens, etc.)
    Ok(())
}
