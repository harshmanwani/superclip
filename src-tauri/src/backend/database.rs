use rusqlite::{Connection, Result, types::FromSql};
use std::path::Path;
use chrono::{DateTime, Utc, Local, NaiveDateTime};

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
    let now = Utc::now();
    conn.execute(
        "INSERT INTO clipboard (content, timestamp) VALUES (?1, ?2)",
        &[content, &now.to_rfc3339()],
    )?;
    Ok(())
}

pub fn get_clipboard_history(conn: &Connection, limit: usize) -> Result<Vec<(String, DateTime<Local>)>> {
    let mut stmt = conn.prepare("SELECT content, timestamp FROM clipboard ORDER BY timestamp DESC LIMIT ?")?;
    let history_iter = stmt.query_map([limit as i64], |row| {
        let content: String = row.get(0)?;
        let timestamp: String = row.get(1)?;
        
        let datetime = DateTime::parse_from_rfc3339(&timestamp)
            .map_err(|e| {
                println!("Error parsing timestamp '{}': {}", timestamp, e);
                rusqlite::Error::FromSqlConversionFailure(1, rusqlite::types::Type::Text, Box::new(e))
            })?;
        
        let local_datetime: DateTime<Local> = DateTime::from(datetime);
        Ok((content, local_datetime))
    })?;
    
    history_iter.collect()
}