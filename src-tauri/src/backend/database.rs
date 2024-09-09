use chrono::{DateTime, Local, Utc};
use directories::ProjectDirs;
use rusqlite::ffi::Error as SqliteError;
use rusqlite::{Connection, Result};
use std::fs;

use once_cell::sync::Lazy;
use std::sync::{Arc, Mutex};

pub static DB_CONNECTION: Lazy<Arc<Mutex<Connection>>> = Lazy::new(|| {
    Arc::new(Mutex::new(
        initialize_database().expect("Failed to initialize database"),
    ))
});

/*
This approach will store the database in:
macOS: ~/Library/Application Support/com.adeelabs.clipsync/
Windows: C:\Users\<username>\AppData\Roaming\adeelabs\clipsync\
*/
fn initialize_database() -> rusqlite::Result<Connection> {
    let project_dirs = ProjectDirs::from("com", "adeelabs", "clipsync")
        .expect("Failed to get project directories");
    let data_dir = project_dirs.data_dir();
    fs::create_dir_all(data_dir).map_err(|e| {
        rusqlite::Error::SqliteFailure(
            SqliteError::new(1), // Use an appropriate error code
            Some(e.to_string()),
        )
    })?;
    let db_path = data_dir.join("clipboard_history.db");

    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS clipboard (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)",
        [],
    )?;

    Ok(conn)
}

pub fn save_clipboard_content(conn: &Connection, content: &str) -> Result<()> {
    let now = Utc::now();
    conn.execute(
        "INSERT INTO clipboard (content, timestamp) VALUES (?1, ?2)",
        &[content, &now.to_rfc3339()],
    )?;
    Ok(())
}

pub fn get_clipboard_history(
    conn: &Connection,
    limit: usize,
) -> Result<Vec<(String, DateTime<Local>)>> {
    let mut stmt =
        conn.prepare("SELECT content, timestamp FROM clipboard ORDER BY timestamp DESC LIMIT ?")?;
    let history_iter = stmt.query_map([limit as i64], |row| {
        let content: String = row.get(0)?;
        let timestamp: String = row.get(1)?;

        let datetime = DateTime::parse_from_rfc3339(&timestamp).map_err(|e| {
            println!("Error parsing timestamp '{}': {}", timestamp, e);
            rusqlite::Error::FromSqlConversionFailure(1, rusqlite::types::Type::Text, Box::new(e))
        })?;

        let local_datetime: DateTime<Local> = DateTime::from(datetime);
        Ok((content, local_datetime))
    })?;

    history_iter.collect()
}
