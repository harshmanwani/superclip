use chrono::{DateTime, Local, Utc};
use directories::ProjectDirs;
use rusqlite::ffi::Error as SqliteError;
use rusqlite::{Connection, Result};
use rusqlite::OptionalExtension;
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
macOS: ~/Library/Application Support/com.adeelabs.superclip/
Windows: C:\Users\<username>\AppData\Roaming\adeelabs\superclip\
*/
fn initialize_database() -> rusqlite::Result<Connection> {
    let project_dirs = ProjectDirs::from("com", "adeelabs", "superclip")
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
        "CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            auth0_id TEXT UNIQUE NOT NULL,
            subscription_status TEXT NOT NULL,
            trial_start TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            extra_data BLOB
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS clips (
            clip_id TEXT PRIMARY KEY,
            user_id TEXT,
            auth0_id TEXT,
            clip_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            synced BOOLEAN DEFAULT FALSE,
            extra_data BLOB,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (auth0_id) REFERENCES users(auth0_id)
        )",
        [],
    )?;

    // Check if a local user exists, if not, create one
    let local_user_exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM users WHERE auth0_id = 'local')",
        [],
        |row| row.get(0),
    )?;

    if !local_user_exists {
        create_local_user(&conn)?;
    }

    Ok(conn)
}

pub fn save_clipboard_content(conn: &Connection, content: &str, auth0_id: Option<&str>) -> Result<()> {
    println!("Saving clipboard content: {}", content);
    let now = Utc::now();
    let clip_id = uuid::Uuid::new_v4().to_string();
    
    let user_id: String = if let Some(id) = auth0_id {
        conn.query_row("SELECT user_id FROM users WHERE auth0_id = ?1", [id], |row| row.get(0))?
    } else {
        conn.query_row("SELECT user_id FROM users WHERE auth0_id = 'local'", [], |row| row.get(0))?
    };

    conn.execute(
        "INSERT INTO clips (clip_id, clip_data, created_at, user_id, auth0_id)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        &[&clip_id, content, &now.to_rfc3339(), &user_id, auth0_id.unwrap_or("local")],
    )?;
    Ok(())
}

pub fn get_clipboard_history(
    conn: &Connection,
    auth0_id: Option<&str>,
    limit: usize,
) -> Result<Vec<(String, DateTime<Local>)>> {
    let query = if let Some(id) = auth0_id {
        "SELECT clip_data, created_at FROM clips WHERE auth0_id = ? OR auth0_id = 'local' ORDER BY created_at DESC LIMIT ?"
    } else {
        "SELECT clip_data, created_at FROM clips WHERE auth0_id = 'local' ORDER BY created_at DESC LIMIT ?"
    };

    let mut stmt = conn.prepare(query)?;
    let id_param = auth0_id.as_ref();
    let params: &[&dyn rusqlite::ToSql] = match id_param {
        Some(id) => &[id, &(limit as i64)],
        None => &[&(limit as i64)],
    };

    let history_iter = stmt.query_map(params, |row| {
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

pub fn store_user_data(
    conn: &Connection,
    user_id: &str,
    auth0_id: &str,
    subscription_status: &str,
    trial_start: Option<DateTime<Utc>>,
    extra_data: Option<&[u8]>,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO users (user_id, auth0_id, subscription_status, trial_start, updated_at, extra_data)
         VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP, ?5)",
        (
            user_id,
            auth0_id,
            subscription_status,
            trial_start.map(|d| d.to_rfc3339()),
            extra_data,
        ),
    )?;

    Ok(())
}

pub fn get_user_data(conn: &Connection, auth0_id: &str) -> Result<Option<serde_json::Value>> {
    let mut stmt = conn.prepare(
        "SELECT user_id, auth0_id, subscription_status, trial_start, created_at, updated_at, extra_data
         FROM users WHERE auth0_id = ?1",
    )?;

    let user = stmt.query_row([auth0_id], |row| {
        Ok(serde_json::json!({
            "user_id": row.get::<_, String>(0)?,
            "auth0_id": row.get::<_, String>(1)?,
            "subscription_status": row.get::<_, String>(2)?,
            "trial_start": row.get::<_, Option<String>>(3)?,
            "created_at": row.get::<_, String>(4)?,
            "updated_at": row.get::<_, String>(5)?,
            "extra_data": row.get::<_, Option<Vec<u8>>>(6)?,
        }))
    }).optional()?;

    Ok(user)
}

pub fn update_clips_with_auth0_id(conn: &Connection, auth0_id: &str) -> Result<()> {
    conn.execute(
        "UPDATE clips SET auth0_id = ?1 WHERE auth0_id IS NULL",
        [auth0_id],
    )?;
    Ok(())
}

pub fn create_local_user(conn: &Connection) -> Result<String> {
    let local_user_id = uuid::Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO users (user_id, auth0_id, subscription_status)
         VALUES (?1, ?2, ?3)",
        &[&local_user_id, "local", "trial"],
    )?;
    Ok(local_user_id)
}