# 云终端数据库设计

## 技术选型
- SQLite (通过 `rusqlite`)
- 数据库文件位置: `$APP_DATA_DIR/cloud-terminal.db`
- 使用 Tauri 命令暴露 CRUD 操作

---

## 表结构

### 1. settings — 键值配置

```sql
CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

存储所有设置项的 JSON 值：
| key | value (JSON) |
|-----|-------------|
| `connection` | `{"host":"192.168.1.100","devicePortType":"lan",...}` |
| `display` | `{"defaultMode":"window","multiMonitor":false,...}` |
| `power` | `{"idleAction":"sleep","idleTimeout":30,...}` |
| `network` | `{"ipMode":"dhcp","gateway":"192.168.1.1",...}` |
| `peripheral` | `{"usbAutoRedirect":true,"audioEnabled":true,...}` |
| `account` | `{"language":"zh-CN","theme":"light",...}` |
| `timeSync` | `{"server":"ntp.aliyun.com","interval":24,...}` |
| `firmware` | `{"currentVersion":"1.0.0","lastCheckTime":"...",...}` |

### 2. connections — 服务器连接记录

```sql
CREATE TABLE connections (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,          -- 连接名称
    host            TEXT NOT NULL,          -- 服务器 IP
    device_port     INTEGER NOT NULL,       -- 设备端口
    service_port    INTEGER NOT NULL,       -- 业务端口
    device_port_type TEXT DEFAULT 'lan',    -- lan/wan/other
    service_port_type TEXT DEFAULT 'lan',   -- lan/wan/other
    is_default      INTEGER DEFAULT 0,     -- 是否默认连接
    last_connected  TEXT,                   -- 最后连接时间
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
```

### 3. login_history — 登录历史

```sql
CREATE TABLE login_history (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device     TEXT NOT NULL,           -- 设备名称
    ip         TEXT NOT NULL,           -- 登录 IP
    login_time TEXT NOT NULL DEFAULT (datetime('now')),
    success    INTEGER DEFAULT 1        -- 1=成功 0=失败
);
```

### 4. usb_policies — USB 设备策略

```sql
CREATE TABLE usb_policies (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL UNIQUE,    -- USB 设备 ID
    name       TEXT NOT NULL,           -- 设备名称
    vendor     TEXT,                    -- 厂商
    device_type TEXT,                   -- storage/camera/serial/hid
    policy     TEXT NOT NULL DEFAULT 'allow',  -- allow/block
    redirect   INTEGER DEFAULT 0,       -- 0=仅充电 1=重定向
    created_at TEXT DEFAULT (datetime('now'))
);
```

### 5. diagnostics — 诊断记录

```sql
CREATE TABLE diagnostics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT NOT NULL,          -- ping/trace/bandwidth
    target      TEXT NOT NULL,           -- 目标地址
    result      TEXT NOT NULL,           -- JSON 结果
    created_at  TEXT DEFAULT (datetime('now'))
);
```

---

## Tauri Rust 命令

```rust
// 设置读写
#[tauri::command]
fn get_setting(key: String) -> Result<Option<String>, String>

#[tauri::command]
fn set_setting(key: String, value: String) -> Result<(), String>

#[tauri::command]
fn get_all_settings() -> Result<HashMap<String, String>, String>

// 连接管理
#[tauri::command]
fn save_connection(conn: ConnectionInfo) -> Result<(), String>

#[tauri::command]
fn get_connections() -> Result<Vec<ConnectionInfo>, String>

#[tauri::command]
fn delete_connection(id: i64) -> Result<(), String>

// 登录历史
#[tauri::command]
fn get_login_history(limit: Option<i64>) -> Result<Vec<LoginRecord>, String>

// USB 策略
#[tauri::command]
fn get_usb_policies() -> Result<Vec<UsbPolicy>, String>

#[tauri::command]
fn set_usb_policy(policy: UsbPolicy) -> Result<(), String>

// 诊断记录
#[tauri::command]
fn save_diagnostic(diag: DiagnosticRecord) -> Result<(), String>
```

---

## Rust 实现文件结构

```
src-tauri/
├── src/
│   ├── main.rs           # Tauri 入口，注册命令
│   ├── db.rs             # 数据库初始化 + 连接管理
│   ├── models/           # 数据模型
│   │   ├── mod.rs
│   │   ├── settings.rs
│   │   ├── connection.rs
│   │   ├── login.rs
│   │   └── usb.rs
│   └── commands/         # Tauri 命令实现
│       ├── mod.rs
│       ├── settings.rs
│       ├── connections.rs
│       ├── login.rs
│       └── usb.rs
```
