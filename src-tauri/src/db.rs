use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_data_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("cloud-terminal.db");
        let conn = Connection::open(db_path)?;
        let db = Database { conn: Mutex::new(conn) };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS connections (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                name            TEXT NOT NULL,
                host            TEXT NOT NULL,
                device_port     INTEGER NOT NULL,
                service_port    INTEGER NOT NULL,
                device_port_type TEXT DEFAULT 'lan',
                service_port_type TEXT DEFAULT 'lan',
                is_default      INTEGER DEFAULT 0,
                last_connected  TEXT,
                created_at      TEXT DEFAULT (datetime('now')),
                updated_at      TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS login_history (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                device     TEXT NOT NULL,
                ip         TEXT NOT NULL,
                login_time TEXT NOT NULL DEFAULT (datetime('now')),
                success    INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS usb_policies (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id   TEXT NOT NULL UNIQUE,
                name        TEXT NOT NULL,
                vendor      TEXT,
                device_type TEXT,
                policy      TEXT NOT NULL DEFAULT 'allow',
                redirect    INTEGER DEFAULT 0,
                created_at  TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS diagnostics (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                type        TEXT NOT NULL,
                target      TEXT NOT NULL,
                result      TEXT NOT NULL,
                created_at  TEXT DEFAULT (datetime('now'))
            );
        ")?;
        Ok(())
    }
}

// ── Settings ──

pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>> {
    let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
    let mut rows = stmt.query(params![key])?;
    match rows.next()? {
        Some(row) => Ok(Some(row.get(0)?)),
        None => Ok(None),
    }
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = datetime('now')",
        params![key, value],
    )?;
    Ok(())
}

pub fn get_all_settings(conn: &Connection) -> Result<Vec<(String, String)>> {
    let mut stmt = conn.prepare("SELECT key, value FROM settings WHERE value != ''")?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

pub fn delete_setting(conn: &Connection, key: &str) -> Result<()> {
    conn.execute("DELETE FROM settings WHERE key = ?1", params![key])?;
    Ok(())
}

// ── Connections ──

pub fn save_connection(conn: &Connection, c: &serde_json::Value) -> Result<()> {
    conn.execute(
        "INSERT INTO connections (name, host, device_port, service_port, device_port_type, service_port_type, is_default)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            c["name"].as_str().unwrap_or(""),
            c["host"].as_str().unwrap_or(""),
            c["device_port"].as_i64().unwrap_or(0),
            c["service_port"].as_i64().unwrap_or(0),
            c["device_port_type"].as_str().unwrap_or("lan"),
            c["service_port_type"].as_str().unwrap_or("lan"),
            c["is_default"].as_i64().unwrap_or(0),
        ],
    )?;
    Ok(())
}

pub fn get_connections(conn: &Connection) -> Result<Vec<serde_json::Value>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, host, device_port, service_port, device_port_type, service_port_type, is_default, last_connected
         FROM connections ORDER BY is_default DESC, last_connected DESC"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "name": row.get::<_, String>(1)?,
            "host": row.get::<_, String>(2)?,
            "device_port": row.get::<_, i64>(3)?,
            "service_port": row.get::<_, i64>(4)?,
            "device_port_type": row.get::<_, String>(5)?,
            "service_port_type": row.get::<_, String>(6)?,
            "is_default": row.get::<_, i64>(7)?,
            "last_connected": row.get::<_, Option<String>>(8)?,
        }))
    })?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

pub fn delete_connection(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM connections WHERE id = ?1", params![id])?;
    Ok(())
}

// ── Login History ──

pub fn add_login_record(conn: &Connection, device: &str, ip: &str, success: bool) -> Result<()> {
    conn.execute(
        "INSERT INTO login_history (device, ip, success) VALUES (?1, ?2, ?3)",
        params![device, ip, success as i64],
    )?;
    Ok(())
}

pub fn get_login_history(conn: &Connection, limit: i64) -> Result<Vec<serde_json::Value>> {
    let mut stmt = conn.prepare(
        "SELECT id, device, ip, login_time, success FROM login_history ORDER BY login_time DESC LIMIT ?1"
    )?;
    let rows = stmt.query_map(params![limit], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "device": row.get::<_, String>(1)?,
            "ip": row.get::<_, String>(2)?,
            "login_time": row.get::<_, String>(3)?,
            "success": row.get::<_, i64>(4)?,
        }))
    })?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

// ── USB Policies ──

pub fn set_usb_policy(conn: &Connection, p: &serde_json::Value) -> Result<()> {
    conn.execute(
        "INSERT INTO usb_policies (device_id, name, vendor, device_type, policy, redirect)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(device_id) DO UPDATE SET policy = ?5, redirect = ?6",
        params![
            p["device_id"].as_str().unwrap_or(""),
            p["name"].as_str().unwrap_or(""),
            p["vendor"].as_str().unwrap_or(""),
            p["device_type"].as_str().unwrap_or(""),
            p["policy"].as_str().unwrap_or("allow"),
            p["redirect"].as_i64().unwrap_or(0),
        ],
    )?;
    Ok(())
}

pub fn get_usb_policies(conn: &Connection) -> Result<Vec<serde_json::Value>> {
    let mut stmt = conn.prepare(
        "SELECT id, device_id, name, vendor, device_type, policy, redirect FROM usb_policies ORDER BY id"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "device_id": row.get::<_, String>(1)?,
            "name": row.get::<_, String>(2)?,
            "vendor": row.get::<_, Option<String>>(3)?,
            "device_type": row.get::<_, Option<String>>(4)?,
            "policy": row.get::<_, String>(5)?,
            "redirect": row.get::<_, i64>(6)?,
        }))
    })?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

// ── Diagnostics ──

pub fn save_diagnostic(conn: &Connection, diag: &serde_json::Value) -> Result<()> {
    conn.execute(
        "INSERT INTO diagnostics (type, target, result) VALUES (?1, ?2, ?3)",
        params![
            diag["type"].as_str().unwrap_or(""),
            diag["target"].as_str().unwrap_or(""),
            &diag["result"].to_string(),
        ],
    )?;
    Ok(())
}
