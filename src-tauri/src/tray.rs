use tauri::{
    menu::{Menu, MenuItem},
    image::Image,
    tray::{MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle,
};
use tauri_nspanel::ManagerExt;

use crate::fns::position_menubar_panel;
use crate::fns::emit_panel_open;

pub fn create(app_handle: &AppHandle) -> tauri::Result<TrayIcon> {
    let icon = Image::from_bytes(include_bytes!("../icons/tray.png"))?;
    let quit_i = MenuItem::with_id(app_handle, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app_handle, &[&quit_i])?;

    TrayIconBuilder::with_id("tray")
        .icon(icon)
        .icon_as_template(true)
        .menu(&menu)
        .menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            // Add more events here
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            let app_handle = tray.app_handle();

            if let TrayIconEvent::Click { button_state, .. } = event {
                if button_state == MouseButtonState::Up {
                    let panel = app_handle.get_webview_panel("main").unwrap();

                    if panel.is_visible() {
                        panel.order_out(None);
                        return;
                    }

                    position_menubar_panel(app_handle, 0.0);
                    emit_panel_open(app_handle);

                    panel.show();
                }
            }
        })
        .build(app_handle)
}
