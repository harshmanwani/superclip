use rusqlite::{Connection, Result};
use std::path::Path;
// use libsql_client::Client as TursoClient;

pub fn initialize_database() -> Result<Connection> {
    let db_path = Path::new("clipboard_history.db"); // Use a relative path
    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS clipboard (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)",
        [],
    )?;

    Ok(conn)
}

pub fn save_clipboard_content(conn: &Connection, content: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO clipboard (content) VALUES (?1)",
        &[content],
    )?;
    Ok(())
}

pub fn get_clipboard_history(conn: &Connection, limit: usize) -> Result<Vec<String>> {
    let mut stmt = conn.prepare("SELECT content FROM clipboard ORDER BY timestamp DESC LIMIT ?")?;
    let content_iter = stmt.query_map([limit as i64], |row| row.get(0))?;
    
    content_iter.collect()
}