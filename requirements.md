# 云终端客户端需求文档

## Cloud Terminal Client Requirements

> 本文档用于将 Demo 对接到已有客户端 SDK。基于 `e:\mxt\terminal` 项目的代码实现反向梳理，
> 明确客户端所有功能模块及其对外部接口（API / Tauri FFI / 协议）的需求。

---

## 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-07-05 | 初版，基于源代码 `design.md` 与现有实现交叉分析 |

---

## 目录

1. [项目概述](#1-项目概述)
2. [对接总览](#2-对接总览)
3. [认证模块](#3-认证模块)
4. [云桌面管理模块](#4-云桌面管理模块)
5. [远程连接模块](#5-远程连接模块)
6. [文件传输模块](#6-文件传输模块)
7. [外设管理模块](#7-外设管理模块)
8. [安全模块](#8-安全模块)
9. [设置模块](#9-设置模块)
10. [持久化存储](#10-持久化存储)
11. [Tauri FFI / 原生桥接](#11-tauri-ffi--原生桥接)
12. [附录：完整 API 端点映射](#12-附录完整-api-端点映射)

---

## 1. 项目概述

### 1.1 技术栈

| 层级 | 技术 |
|------|------|
| UI 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 状态管理 | Zustand |
| 路由 | React Router v6 |
| 桌面框架 | Tauri 1.x (Rust) |
| 远程桌面协议 | SPICE（主要）、RDP、Moonlight |
| HTTP 客户端 | Axios |
| 数据持久化 | localStorage（Web）/ SQLite via Tauri（桌面） |

### 1.2 架构分层

```
UI (React Components)
  → 状态层 (Zustand Stores: auth / desktop / connection / settings)
    → 服务层 (API Services / SPICE Client / File Transfer / Security)
      → 平台适配层 (Tauri FFI / WebSocket / Web APIs)
```

### 1.3 平台适配

| 功能 | 桌面端 (Tauri) | Web 端 |
|------|---------------|--------|
| SPICE 连接 | Rust FFI → `spice-bridge.dll` (C API) | WebSocket → websockify proxy |
| RDP 连接 | Tauri invoke → `rdp_connect` | 下载 .rdp 文件 |
| Moonlight 连接 | Tauri invoke → `moonlight_start` | 不支持 |
| 设置持久化 | SQLite (Rusqlite, Tauri commands) | localStorage |
| 文件系统 | Tauri FS API | 浏览器 File API |
| 全屏 | `@tauri-apps/api/window` | Fullscreen API |
| USB | `spice-bridge.dll` → `spice_get_usb_list` | 有限支持 |
| 端口探测 | Tauri invoke → `check_port` (TCP) | WebSocket + HTTP fetch |

---

## 2. 对接总览

要完成 Demo 与已有客户端 SDK 的对接，需要实现以下四类契约：

1. **REST API 端点** — 认证、桌面管理、文件传输的 HTTP 接口
2. **SPICE 连接通道** — SPICE 协议或 WebSocket 代理，支持帧传输与输入回传
3. **Tauri FFI 命令** — Rust 层暴露给前端 JavaScript 的原生能力
4. **数据模型** — TypeScript 类型定义与后端 JSON 数据结构的映射

各模块当前使用 **Mock 数据** 的标记位如下（源代码中可搜索 `// TODO:`）：

| 模块 | 文件 | Mock 位置 |
|------|------|-----------|
| authStore | `src/store/authStore.ts` | `login()` 第 47 行，无 API 调用 |
| desktopStore | `src/store/desktopStore.ts` | `fetchDesktops()` 第 127 行，返回硬编码数组 |
| connectionStore | `src/store/connectionStore.ts` | `connect()` 第 134-166 行，无实际 SPICE 调用 |
| settingsStore | `src/store/settingsStore.ts` | `checkFirmwareUpdate()` 第 172 行 |
| spiceClient | `src/services/spice/client.ts` | `connect()` 第 54 行，模拟延时无真实连接 |

---

## 3. 认证模块

### 3.1 功能列表

- [x] 用户名/密码登录
- [x] 记住密码 / 自动登录
- [x] 本地账号管理（保存/删除/自动填入）
- [x] 用户注册（模拟）
- [x] MFA 多因素认证（TOTP/SMS/Email）
- [x] Token 自动刷新（Axios 拦截器）
- [x] 组织 ID 管理
- [ ] SSO/OAuth 单点登录（接口已定义，尚未绑定 UI）
- [ ] 会话管理（接口已定义，尚未绑定 UI）

### 3.2 所需 API 端点

参考 [api-docs.md](api-docs.md) 和 [src/services/api/auth.ts](src/services/api/auth.ts)：

| 方法 | 端点 | 用途 |
|------|------|------|
| POST | `/auth/login` | 用户名密码登录 |
| POST | `/auth/mfa/verify` | MFA 二次验证 |
| GET | `/auth/mfa/setup?sessionId=` | 获取 MFA 配置（可用方法） |
| POST | `/auth/refresh` | 刷新 Token |
| POST | `/auth/logout` | 登出 |
| GET | `/auth/me` | 获取当前用户信息 |
| PUT | `/auth/profile` | 更新用户信息 |
| GET | `/auth/organizations` | 获取组织列表 |
| POST | `/auth/sso/{provider}/callback` | SSO 回调 |

### 3.3 数据模型

```typescript
// 登录请求
interface LoginRequest {
  username: string;
  password: string;
  organizationId?: string;
  rememberMe?: boolean;
}

// 登录响应
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserInfo;
}

// MFA 验证请求
interface MFARequest {
  sessionId: string;
  method: 'totp' | 'sms' | 'email';
  code: string;
}

// MFA 配置响应
interface MFASetupInfo {
  sessionId: string;
  required: boolean;
  methods: MFAMethod[];
  preferredMethod: MFAMethod;
}
```

### 3.4 状态管理 (authStore)

| 状态 | 类型 | 说明 |
|------|------|------|
| isAuthenticated | boolean | 是否已认证 |
| user | UserInfo \| null | 当前用户 |
| accessToken | string \| null | 访问令牌 |
| refreshToken | string \| null | 刷新令牌 |
| loading | boolean | 请求中 |
| error | string \| null | 错误信息 |
| mfaRequired | boolean | 是否需要 MFA |
| mfaSessionId | string \| null | MFA 会话 ID |
| pendingCredentials | LoginRequest \| null | MFA 流程中暂存的登录凭证 |

### 3.5 Token 管理

前端 Axios 客户端在 `src/services/api/client.ts` 实现了自动 Token 管理：

1. **请求拦截器** — 从 `localStorage` 读取 `auth_token` 附加到 `Authorization` 头
2. **响应拦截器** — 收到 401 时自动调用 `/auth/refresh` 刷新 Token
3. **刷新防抖** — `refreshPromise` 防止并发刷新
4. **刷新失败** — 清空 Token 并跳转到 `/login`

> **对接要求**：后端 `/auth/refresh` 端点需要返回新的 `accessToken` 和 `refreshToken`，且前端 `localStorage` 中的 key 为 `auth_token` 和 `refresh_token`。

### 3.6 登录流程

```
LoginPage → authStore.login()
  → POST /auth/login
    ↓
  [响应 code === 2001? MFA 需要]
    ├─ Yes → MFAVerification → POST /auth/mfa/verify
    │         → 成功 → 设置 Token → 跳转首页
    └─ No  → 设置 Token → 跳转首页
```

---

## 4. 云桌面管理模块

### 4.1 功能列表

- [x] 桌面列表 / 网格视图切换
- [x] 状态过滤（全部 / 运行中 / 已关机 / 已休眠）
- [x] 电源管理（开机 / 关机 / 重启 / 休眠 / 唤醒）
- [x] 配置信息查看（CPU / 内存 / 磁盘）
- [x] 计费信息查看
- [x] 还原点管理（创建 / 列表 / 从还原点恢复）
- [x] 桌面密码重置
- [ ] 桌面搜索（接口已定义，UI 待补充）

### 4.2 所需 API 端点

参考 [src/services/api/desktop.ts](src/services/api/desktop.ts)：

| 方法 | 端点 | 用途 |
|------|------|------|
| GET | `/desktops` | 获取桌面列表（支持 `page`、`pageSize`、`status`、`search`） |
| GET | `/desktops/{id}` | 获取桌面详情 |
| POST | `/desktops/{id}/power` | 电源操作（`action: start/stop/restart/suspend/resume`） |
| GET | `/desktops/{id}/power` | 获取电源状态 |
| GET | `/desktops/{id}/config` | 获取桌面配置信息 |
| GET | `/desktops/{id}/billing` | 获取计费信息 |
| POST | `/desktops/{id}/password` | 重置桌面密码 |
| POST | `/desktops/{id}/restore-points` | 创建还原点 |
| GET | `/desktops/{id}/restore-points` | 获取还原点列表 |
| POST | `/desktops/{id}/restore` | 从还原点恢复 |

### 4.3 数据模型

```typescript
// 云桌面完整信息
interface CloudDesktop {
  id: string;
  name: string;
  description?: string;
  status: 'running' | 'stopped' | 'suspended' | 'starting' | 'stopping' | 'error' | 'unknown';
  osType: 'windows' | 'linux' | 'ubuntu' | 'centos' | 'custom';
  osName: string;          // 例如 "Windows Server 2022"
  cpu: number;             // vCPU 核心数
  memory: number;          // GB
  diskSize: number;        // GB
  ipAddress: string;
  spicePort: number;       // SPICE 端口 (默认 5900)
  spicePassword?: string;  // SPICE 连接密码
  createdAt: string;       // ISO 8601
  expiredAt?: string;
  imageName?: string;
  region?: string;         // 区域
  tags?: Record<string, string>;
}

// 电源操作请求
type DesktopPowerAction = 'start' | 'stop' | 'restart' | 'suspend' | 'resume';

// 计费信息
interface DesktopBilling {
  chargingMode: 'prepaid' | 'postpaid' | 'monthly';
  price: number;
  totalSpent: number;
  estimatedMonthly: number;
  balance: number;
  autoRenew: boolean;
}

// 桌面列表过滤
interface DesktopListFilter {
  status?: DesktopStatus;
  search?: string;
  page: number;
  pageSize: number;
}
```

> **重要**：`CloudDesktop` 中的 `ipAddress` 和 `spicePort` 是 **SPICE 连接的核心参数**。后端返回时必须提供正确的值，否则客户端的 `ConnectionView` 无法连接到远程桌面。

---

## 5. 远程连接模块

### 5.1 功能列表

- [x] SPICE 协议桌面连接（主要协议）
- [x] RDP 协议支持（Windows 远程桌面）
- [x] Moonlight 协议支持（游戏串流）
- [x] 连接状态管理（disconnected → connecting → connected → disconnecting）
- [x] 画质设置（智能模式 / 流畅优先 / 画质优先 / 自定义）
- [x] 分辨率自适应与设置
- [x] 全屏 / 窗口切换
- [x] 连接指标监控（FPS / 延迟 / 带宽 / 丢包率 / RTT / Jitter）
- [x] 画面 Canvas 渲染（Tauri 原生桥接 或 WebSocket）
- [x] 键盘 / 鼠标事件转发
- [x] 剪贴板双向传输
- [x] USB 设备重定向
- [x] 文件传输通道

### 5.2 协议支持架构

```
┌──────────────────────────────┐
│        ConnectionView        │  ← React Router: /desktop/:id
├──────────────────────────────┤
│     connectionStore.connect()│  ← Zustand
├──────────────────────────────┤
│       ProtocolConnectionManager   │  ← src/services/connection/ConnectionManager.ts
├──────────┬──────────┬───────┤
│          │          │       │
│  SPICE   │   RDP    │Moonlight│
│          │          │       │
├──────────┴──────────┴───────┤
│    平台分发 (isTauri 检测)      │
│  ┌──────────┐ ┌──────────┐  │
│  │ Tauri FFI│ │WebSocket │  │
│  │ (原生)    │ │ (Web)    │  │
│  └──────────┘ └──────────┘  │
└─────────────────────────────┘
```

### 5.3 SPICE 连接详情

#### 5.3.1 桌面端 (Tauri) 连接流程

```
SpiceCanvas → connect_spice(host, port, password)
  → Tauri invoke('connect_spice', { host, port, password })
    → Rust main.rs: connect_spice()
      → spice_ffi::SpiceSessionHandle::connect()
        → 加载 spice-bridge.dll
          → C API: spice_start(host, port, password, on_frame_cb, on_status_cb, userdata)
            → 启动 SPICE 客户端会话
  → 帧接收线程: frame_rx → base64 → emit_all("spice-bridge", json)
  → 状态接收线程: status_rx → emit_all("spice-bridge", json)
  → 前端 listen('spice-bridge') → 渲染帧到 Canvas
```

**spice-bridge.dll C API 签名**（参考 `spice_ffi.rs`）：

```c
// 必须导出的函数
int spice_start(
    const char* host, int port, const char* password,
    void (*on_frame)(int w, int h, const uint8_t* rgba, int size, void* userdata),
    void (*on_status)(const char* message, void* userdata),
    void* userdata
);

void spice_stop();

void spice_send_key(const char* key, int down);
void spice_send_mouse_move(int x, int y);
void spice_send_mouse_button(int button, int down);
int spice_get_usb_list(char* buffer, int buffer_size);
```

#### 5.3.2 Web 端连接流程

```
SpiceCanvas → WebSocket(`ws://${host}:${port}`)
  → 需要 WebSocket 代理（如 websockify）将 WS 转为 TCP
  → SPICE 帧数据 → ArrayBuffer → Blob → Image → Canvas
  → 键盘/鼠标事件 → JSON 字符串 → WebSocket.send()
```

#### 5.3.3 帧数据协议（Tauri → 前端事件）

```typescript
// spice-bridge 事件
type SPICEBridgeEvent =
  | { type: 'frame'; data: { w: number; h: number; rgba: string } }  // rgba = base64 编码的 RGBA 像素数据
  | { type: 'status'; data: { message: string } }
  | { type: 'ready' };

// 前端监听
app.listen('spice-bridge', (event) => {
  const msg = JSON.parse(event.payload);
  switch (msg.type) {
    case 'frame':  // 渲染到 Canvas
    case 'status': // 更新状态
    case 'ready':  // 桥接就绪
  }
});
```

### 5.4 RDP 连接详情

**桌面端**：Tauri invoke → `rdp_connect` → Rust 命令生成 .rdp 文件并用 `mstsc.exe` 打开

**Web 端**：生成 .rdp 文件并触发下载，由用户手动用远程桌面打开

```typescript
interface RdpConfig {
  username: string;
  password: string;
  domain?: string;
  desktopWidth: number;
  desktopHeight: number;
  enableClipboard: boolean;
  enableAudio: boolean;
  enablePrinter: boolean;
  gateway?: { host: string; port: number; username: string; password: string };
}
```

### 5.5 Moonlight 连接详情

- 仅支持桌面端 (Tauri)
- Tauri invoke → `moonlight_start` → Rust 命令启动 Moonlight 客户端

```typescript
interface MoonlightConfig {
  serverId: string;
  serverName: string;
  appName: string;
  bitrate: number;       // kbps, 默认 20000
  fps: number;           // 默认 60
  resolution: { width: number; height: number };
  enableAudio: boolean;
  audioDevice: string;
}
```

### 5.6 连接状态管理 (connectionStore)

```typescript
interface ConnectionStateInfo {
  state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';
  desktopId: string;
  connectionId?: string;
  connectedAt?: string;
  disconnectedAt?: string;
  error?: string;
  metrics?: ConnectionMetrics;
  displaySettings: DisplaySettings;
  spiceConfig: SPICEConfig;
}

interface ConnectionMetrics {
  fps: number;
  latency: number;       // ms
  bandwidth: number;     // Mbps
  packetsLost: number;
  cpuUsage: number;      // %
  memoryUsage: number;   // %
  frameWidth: number;
  frameHeight: number;
  codec?: string;
  rtt: number;           // ms
  jitter: number;        // ms
}
```

### 5.7 画面质量预设

| 模式 | 带宽要求 | 色深 | 适用场景 |
|------|---------|------|---------|
| 流畅优先 (smooth) | ≥ 2 Mbps | 16-bit | 网络较差环境 |
| 均衡模式 (quality) | ≥ 5 Mbps | 24-bit | 一般网络环境 |
| 画质优先 (smart) | ≥ 10 Mbps | 32-bit | 高清体验 |
| 无损模式 (custom) | ≥ 50 Mbps | 32-bit | 设计/影音专业场景 |

### 5.8 输入事件转发

```typescript
// 键盘事件 (SpiceClient)
sendKeyboardEvent(key: string, pressed: boolean): void
  → Tauri: window.__TAURI__.invoke('spice_keyboard', { key, pressed })
  → Web:   ws.send(JSON.stringify({ type: 'keyboard', key, down: pressed }))

// 鼠标事件
sendMouseEvent(x: number, y: number, buttons: number, wheelMotion?: number): void
  → Tauri: window.__TAURI__.invoke('spice_mouse', { x, y, buttons, wheelMotion })
  → Web:   ws.send(JSON.stringify({ type: 'mousemove', x, y, buttons }))
```

### 5.9 悬浮球功能（FloatingBall）

连接成功后显示在画面底部的悬浮操作入口，提供：

| 功能 | 实现状态 |
|------|---------|
| 画质切换面板（智能/流畅/画质/自定义） | ✅ 已有 UI |
| 状态监控面板（FPS/分辨率/延迟/带宽/丢包率） | ✅ 已有 UI |
| USB 外设管理面板 | ✅ 已有 UI |
| 音频设备面板（扬声器/麦克风选择） | ✅ 已有 UI |
| 远程控制面板（查看当前连接用户） | ✅ 已有 UI |
| AI 助手（占位） | ⬜ 待实现 |
| 文件传输入口 | ⬜ 待实现 |
| 剪贴板管理 | ⬜ 待实现 |
| 投屏/共享协同 | ⬜ 待实现 |

---

## 6. 文件传输模块

### 6.1 功能列表

- [x] 文件列表浏览（远程桌面目录浏览）
- [x] 磁盘列表获取
- [x] 创建目录
- [x] 文件上传 / 下载
- [x] 传输队列管理
- [x] 传输进度显示与速度计算
- [x] 暂停 / 恢复 / 取消
- [x] 传输历史
- [ ] 拖拽上传（UI 已预留，待绑定）
- [ ] 全速模式切换

### 6.2 所需 API 端点

参考 [src/services/api/file.ts](src/services/api/file.ts)：

| 方法 | 端点 | 用途 |
|------|------|------|
| GET | `/transfer/{desktopId}/files?path=` | 列举目录文件 |
| GET | `/transfer/{desktopId}/disks` | 获取磁盘列表 |
| POST | `/transfer/{desktopId}/directory` | 创建目录 |
| POST | `/transfer/{desktopId}/upload` | 上传文件（`multipart/form-data`） |
| GET | `/transfer/{desktopId}/download?path=` | 下载文件 |
| GET | `/transfer/{desktopId}/history` | 获取传输历史 |
| POST | `/transfer/{taskId}/cancel` | 取消传输 |
| POST | `/transfer/{taskId}/toggle` | 暂停/恢复传输 |

### 6.3 数据模型

```typescript
interface FileItem {
  name: string;
  path: string;
  size: number;           // bytes
  type: 'file' | 'directory';
  mimeType?: string;
  modifiedAt: string;
  checksum?: string;
}

interface TransferTask {
  id: string;
  direction: 'upload' | 'download';
  name: string;
  localPath: string;
  remotePath: string;
  size: number;
  transferred: number;
  speed: number;          // bytes/s
  status: 'pending' | 'transferring' | 'paused' | 'completed' | 'failed' | 'cancelled';
  mode: 'normal' | 'turbo';
  error?: string;
  createdAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;  // seconds
}

interface TransferOptions {
  mode: 'normal' | 'turbo';
  overwrite: 'ask' | 'always' | 'skip' | 'rename';
  preserveAttributes: boolean;
  bandwidthLimit?: number;  // KB/s, 0=无限制
  compression: boolean;
  encrypt: boolean;
}

interface DiskInfo {
  path: string;
  name: string;
  totalSpace: number;
  freeSpace: number;
  fileSystem: string;
  isRemovable: boolean;
}
```

---

## 7. 外设管理模块

### 7.1 功能列表

- [x] USB 设备列表获取
- [x] USB 设备重定向 / 取消重定向
- [x] USB 管控策略（全部允许 / 全部禁止 / 按设备）
- [x] 音频设备枚举与选择（扬声器 / 麦克风）
- [x] 外设策略配置（按类别：USB/打印机/摄像头/麦克风等）
- [ ] 打印机映射与驱动管理
- [ ] 智能卡/UKey 支持

### 7.2 数据模型

```typescript
// 外设设备
interface PeripheralDevice {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  productId: string;
  category: PeripheralCategory;
  status: PeripheralStatus;
  driverInstalled: boolean;
}

type PeripheralCategory = 'usb' | 'printer' | 'camera' | 'microphone' | 'smartcard' | 'storage' | 'keyboard' | 'mouse' | 'other';
type RedirectPolicy = 'allow' | 'deny' | 'ask';

// USB 设备详情
interface USBDevice extends PeripheralDevice {
  category: 'usb';
  usbClass: number;
  usbSubclass: number;
  protocol: number;
  speed: 'low' | 'full' | 'high' | 'super';
}

// 外设策略
interface PeripheralPolicy {
  category: PeripheralCategory;
  policy: RedirectPolicy;
  whitelist?: string[];
  blacklist?: string[];
  readOnly?: boolean;
}
```

### 7.3 USB 列表获取（Tauri）

```
window.__TAURI__.invoke('get_usb_devices')
  → Rust: main.rs → get_usb_devices()
    → spice-bridge.dll: spice_get_usb_list(buf, 4096)
      → 返回 JSON 字符串数组 → 前端解析
```

---

## 8. 安全模块

### 8.1 功能列表

- [x] 明水印绘制（Canvas 覆盖层，含用户信息 + 时间戳）
- [x] 暗水印嵌入（图像数据蓝色通道 LSB 隐写）
- [x] 动态水印每 30 秒刷新（防截屏追溯）
- [x] 剪贴板管控策略显示（方向 / 类型 / 大小限制）
- [x] 审计日志查看（登录 / 剪贴板 / 文件传输）
- [x] 安全策略总览（USB / 打印机 / 磁盘映射 / 录屏等）
- [ ] 安全策略编辑（UI 为只读展示，待绑定编辑功能）

### 8.2 数据模型

```typescript
interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  content: string;
  style: 'light' | 'dark';
  opacity: number;         // 0-1
  fontSize: number;
  fontColor: string;
  rotation: number;        // degrees
  density: number;
  dynamic: boolean;        // 动态显示用户信息+时间戳
  userId?: string;
  userName?: string;
  timestamp?: string;
}

interface SecurityPolicy {
  watermark: WatermarkConfig;
  clipboard: ClipboardPolicy;
  usbRedirect: boolean;
  usbReadOnly: boolean;
  printerMapping: boolean;
  diskMapping: boolean;
  diskMappingReadOnly: boolean;
  screenRecording: boolean;
  screenRecordingRetentionDays: number;
  trustedDeviceOnly: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;    // minutes
}

interface ClipboardPolicy {
  direction: 'localToRemote' | 'remoteToLocal' | 'both' | 'disabled';
  allowedTypes: ('plaintext' | 'richtext' | 'image' | 'file')[];
  maxSize: number;           // bytes
  auditEnabled: boolean;
}

interface AuditRecord {
  eventType: 'screen_capture' | 'clipboard' | 'file_transfer' | 'login' | 'peripheral' | 'print';
  userId: string;
  userName: string;
  desktopId: string;
  timestamp: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
  screenshotUrl?: string;
}
```

### 8.3 水印渲染流程

```
Watermark 组件 → Canvas 绘制
  → 明水印: 旋转文本覆盖层 (z-index: 2147483647, pointer-events: none)
  → 暗水印: watermarkService.embedBlindWatermark(imageData, userId)
    → 在图像数据 Blue 通道 LSB（最低有效位）嵌入用户标识
  → 动态刷新: setInterval(30s) 重新渲染（更新时间戳）
```

---

## 9. 设置模块

### 9.1 功能列表

| 子模块 | 文件 | 功能 |
|--------|------|------|
| 接入设置 | ConnectionSettings.tsx | 服务器 IP、设备端口(60442/60443)、业务端口(8888/8889)、TLS、自动重连、超时、心跳 |
| 屏幕设置 | DisplaySettings.tsx | 默认模式(窗口/全屏)、画质、色深、帧率限制、缩放、多屏、DPI |
| 电源设置 | PowerSettings.tsx | 空闲操作(休眠/关机)、超时、定时开关机、关闭时关机、断开时关机 |
| 外设设置 | PeripheralSettings.tsx | USB 自动重定向、音频设备选择、智能卡 |
| 网络设置 | NetworkSettings.tsx | IP 模式(DHCP/静态)、DNS、代理(HTTP/SOCKS5)、带宽限制、QUIC、Portal 认证 |
| 账号安全 | AccountSettings.tsx | 语言(中/英/日)、主题(亮/暗/自动)、自动登录、双因素认证 |
| 固件升级 | FirmwareUpdate.tsx | 版本检查、在线升级、本地升级 |
| 设备校时 | DeviceTimeSync.tsx | NTP 服务器、同步间隔、时区 |
| 诊断工具 | DiagnosticTools.tsx | 网络连通性、SPICE 连通性、API 连通性、延迟/丢包率、CPU/内存/磁盘 |
| 关于终端 | About.tsx | 版本信息、版权 |

### 9.2 设置持久化

- **Web 端**: `localStorage` key = `app_settings`
- **桌面端 (Tauri)**: SQLite 数据库，通过 Tauri commands 操作

设置使用深度合并策略：只合并传入的顶层 key，不覆盖其他未传入的完整对象。

### 9.3 完整设置模型

```typescript
interface AppSettings {
  connection: ConnectionSettings;   // 默认 host: 192.168.201.131, devicePort: 60442, servicePort: 8888
  display: DisplaySettingsConfig;   // 默认 mode: window, quality: smart, dpiScaling: auto
  power: PowerSettings;             // 默认 idleAction: sleep, idleTimeout: 30min
  peripheral: PeripheralSettings;   // 默认 usbAutoRedirect: true
  network: NetworkSettings;         // 默认 ipMode: dhcp, DNS: 8.8.8.8 / 114.114.114.114
  account: AccountSettings;         // 默认 language: zh-CN, theme: dark
  timeSync: TimeSyncConfig;         // 默认 NTP: ntp.aliyun.com, interval: 24h
  firmware: FirmwareInfo;           // 当前版本: 1.0.0
}
```

---

## 10. 持久化存储

### 10.1 存储内容

| Key | 内容 | 用途 |
|-----|------|------|
| `auth_token` | accessToken | 请求认证 |
| `refresh_token` | refreshToken | Token 刷新 |
| `auth_user` | UserInfo (JSON) | 用户信息缓存 |
| `app_settings` | AppSettings (JSON) | 设置持久化 |
| `login_credentials` | SavedAccount[] (JSON) | 保存的账号列表 |
| `logged_out` | "true" | 标记已退出登录（防止自动登录） |

### 10.2 Tauri SQLite 数据库

Rust 后端使用 `rusqlite` 维护 SQLite 数据库。Tauri 命令参考 `main.rs`：

| 命令 | 用途 |
|------|------|
| `db_get_setting(key)` | 读取单个设置 |
| `db_set_setting(key, value)` | 写入单个设置 |
| `db_get_all_settings()` | 读取所有设置 |
| `db_delete_setting(key)` | 删除设置 |
| `db_get_connections()` | 获取保存的连接记录 |
| `db_save_connection(connection)` | 保存连接记录 |
| `db_delete_connection(id)` | 删除连接记录 |
| `db_get_login_history(limit)` | 获取登录历史 |
| `db_get_usb_policies()` | 获取 USB 策略 |
| `db_set_usb_policy(policy)` | 设置 USB 策略 |

---

## 11. Tauri FFI / 原生桥接

### 11.1 已注册 Tauri 命令

| 命令 | 参数 | 用途 |
|------|------|------|
| `connect_spice` | host, port, password | 建立 SPICE 连接 |
| `disconnect_spice` | (none) | 断开 SPICE 连接 |
| `send_spice_input` | event_type, data | 转发键盘/鼠标输入 |
| `get_usb_devices` | (none) | 获取 USB 设备列表 |
| `check_port` | host, port, timeout_ms | TCP 端口连通性探测 |
| 数据库命令 | 见上节 | 设置持久化 |

### 11.2 RDP 命令（待实现）

| 命令 | 参数 | 用途 |
|------|------|------|
| `rdp_connect` | host, port, username, password, domain, width, height, fullscreen | 启动 RDP 连接 |
| `rdp_disconnect` | (none) | 断开 RDP |

### 11.3 Moonlight 命令（待实现）

| 命令 | 参数 | 用途 |
|------|------|------|
| `moonlight_start` | serverId, appName, bitrate, fps, width, height | 启动 Moonlight 串流 |
| `moonlight_stop` | (none) | 停止串流 |

### 11.4 加载 spice-bridge.dll 的路径优先级

```rust
// src-tauri/src/spice_ffi.rs Line 55-62
// DLL 搜索顺序:
1. 当前目录 / spice-bridge.dll
2. 系统路径 spice-bridge.dll
3. target/debug/spice-bridge.dll
4. E:/mxt/terminal/spice-bridge.dll  (硬编码)
```

> **对接要求**：`spice-bridge.dll` 需要导出 `spice_start`, `spice_stop`, `spice_send_key`, `spice_send_mouse_move`, `spice_send_mouse_button`, `spice_get_usb_list` 共 6 个 C 函数。

---

## 12. 附录：完整 API 端点映射

### REST API 端点

```
POST   /auth/login                          → authApi.login()
POST   /auth/mfa/verify                     → authApi.verifyMFA()
GET    /auth/mfa/setup                      → authApi.getMFASetup()
POST   /auth/refresh                        → authApi.refreshToken()
POST   /auth/logout                         → authApi.logout()
GET    /auth/me                             → authApi.getCurrentUser()
PUT    /auth/profile                        → authApi.updateProfile()
GET    /auth/organizations                  → authApi.getOrganizations()
GET    /auth/sso/{orgId}                    → authApi.getSSOConfig()
POST   /auth/sso/{provider}/callback         → authApi.ssoLogin()

GET    /desktops                            → desktopApi.list()
GET    /desktops/{id}                       → desktopApi.getById()
POST   /desktops/{id}/power                 → desktopApi.powerAction()
GET    /desktops/{id}/power                 → desktopApi.getPowerInfo()
GET    /desktops/{id}/config                → desktopApi.getConfig()
GET    /desktops/{id}/billing               → desktopApi.getBilling()
POST   /desktops/{id}/password              → desktopApi.resetPassword()
POST   /desktops/{id}/restore-points        → desktopApi.createRestorePoint()
GET    /desktops/{id}/restore-points        → desktopApi.getRestorePoints()
POST   /desktops/{id}/restore               → desktopApi.restoreFromPoint()

GET    /transfer/{desktopId}/files          → fileApi.listFiles()
GET    /transfer/{desktopId}/disks          → fileApi.getDisks()
POST   /transfer/{desktopId}/directory      → fileApi.createDirectory()
POST   /transfer/{desktopId}/upload         → fileApi.upload()
GET    /transfer/{desktopId}/download       → fileApi.download()
GET    /transfer/{desktopId}/history        → fileApi.getHistory()
POST   /transfer/{taskId}/cancel            → fileApi.cancelTransfer()
POST   /transfer/{taskId}/toggle            → fileApi.toggleTransfer()
```

### WebSocket/事件通道

```
SPICE 帧数据:   ws://{host}:{port} [ArrayBuffer/JSON]  (Web)
                tauri://spice-bridge [JSON]              (Tauri)
输入事件:       ws.send(JSON)                            (Web)
                invoke('send_spice_input')               (Tauri)
```

### Tauri 桥接命令

```
invoke('connect_spice', { host, port, password })
invoke('disconnect_spice')
invoke('send_spice_input', { event_type, data })
invoke('get_usb_devices')
invoke('check_port', { host, port, timeout_ms })
invoke('rdp_connect', { host, port, username, password, domain, width, height, fullscreen })
invoke('moonlight_start', { serverId, appName, bitrate, fps, width, height })
invoke('db_*', ...)    // 9 个数据库命令
```

### 通用响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "requestId": "req-xxx"
}
```

### 业务状态码

| code | 含义 |
|------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 1003 | 访问被拒绝 |
| 1004 | 资源不存在 |
| 1005 | 请求超时 |
| 2001 | MFA 验证需要 |
| 2002 | MFA 验证失败 |
| 3001 | 桌面电源操作冲突 |
| 3002 | 桌面连接失败 |
| 3003 | 桌面已达到最大连接数 |
| 4001 | 文件传输失败 |
| 4002 | 文件太大 |
| 4003 | 文件类型被禁止 |
| 5001 | 外设重定向失败 |
| 5002 | 外设已被占用 |
| 9001 | 系统内部错误 |
| 9002 | 服务不可用 |

### 默认连接参数

```yaml
默认服务器:    192.168.201.131
SPICE 端口:    5900 (设备端口: 60442, 业务端口: 8888)
默认管理员凭证: admin / admin123
默认 MFA 验证码: 123456
```

---

## 附录 A：关键文件索引

| 文件路径 | 功能 |
|----------|------|
| `src/App.tsx` | 根组件，路由定义，侧边栏布局（TP-LINK 深蓝主题） |
| `src/types/` | 所有 TypeScript 类型定义（auth, desktop, connection, file-transfer, peripheral, security, settings, protocol） |
| `src/services/api/client.ts` | Axios HTTP 客户端，Token 自动附加和刷新 |
| `src/services/api/auth.ts` | 认证 API 定义 |
| `src/services/api/desktop.ts` | 桌面管理 API 定义 |
| `src/services/api/file.ts` | 文件传输 API 定义 |
| `src/services/spice/client.ts` | SPICE 协议客户端封装（事件系统、指标监控） |
| `src/services/connection/ConnectionManager.ts` | 多协议连接管理器（SPICE/RDP/Moonlight） |
| `src/services/security/watermark.ts` | 水印服务（明暗水印、LSB 隐写） |
| `src/services/file-transfer/index.ts` | 文件传输服务（队列、进度、并发控制） |
| `src/services/db.ts` | 数据持久化适配层（localStorage / Tauri SQLite） |
| `src/store/authStore.ts` | 认证状态管理（含 Mock 登录逻辑） |
| `src/store/desktopStore.ts` | 桌面管理状态管理（含 Mock 数据） |
| `src/store/connectionStore.ts` | 连接状态管理（含 Tauri 桥接调用） |
| `src/store/settingsStore.ts` | 设置状态管理（含深度合并和持久化） |
| `src/components/connection/SpiceCanvas.tsx` | SPICE 画面渲染 Canvas（Tauri + WebSocket 双模式） |
| `src/components/connection/SpiceWebViewer.tsx` | SPICE WebSocket 查看器（websockify 代理模式） |
| `src/components/connection/RdpCanvas.tsx` | RDP 连接 GUI（生成 .rdp 文件） |
| `src/components/connection/MoonlightCanvas.tsx` | Moonlight 串流连接 GUI |
| `src/components/floating-ball/FloatingBall.tsx` | 悬浮球（画质/USB/音频/远程控制面板） |
| `src/components/security/SecurityDashboard.tsx` | 安全中心（策略/水印/剪贴板/审计日志） |
| `src-tauri/src/main.rs` | Tauri Rust 入口 + 所有 Tauri 命令注册 |
| `src-tauri/src/spice_ffi.rs` | spice-bridge.dll 的 Rust FFI 绑定 |
| `api-docs.md` | REST API 接口文档 |
| `design.md` | 软件设计文档 |
