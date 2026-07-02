# 云终端软件设计文档

## Cloud Terminal Client Design Document

> 参考阿里无影云电脑系统功能，基于 SPICE 桌面协议的跨平台云终端客户端。

---

## 1. 系统概述

### 1.1 项目目标
构建一个跨平台（Linux/Windows/Web）的云终端软件，通过 SPICE 协议连接远程云桌面，提供类本地桌面的操作体验，集成云桌面管理、文件传输、外设重定向、安全管控等企业级功能。

### 1.2 技术栈

| 层级 | 技术选择 |
|------|----------|
| UI 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 状态管理 | Zustand |
| 路由 | React Router v6 |
| 桌面框架 | Tauri 1.x (Rust) |
| 远程桌面协议 | SPICE (spice-client-gtk / spicec) |
| HTTP 客户端 | Axios |
| UI 组件库 | 自研 (暗色主题) |

### 1.3 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                    用户界面层 (React)                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 登录  │ │桌面管理│ │连接视图│ │悬浮球 │ │设置  │ │安全  │ │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ │
├─────┴────────┴────────┴────────┴────────┴────────┴──────┤
│                    状态管理层 (Zustand)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ authStore│ │desktop   │ │connection│ │settings  │   │
│  │          │ │Store     │ │Store     │ │Store     │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
├───────┴────────────┴────────────┴────────────┴──────────┤
│                     服务层 (Services)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ API Client │ SPICE    │ │File      │ │Security  │   │
│  │ (Axios)  │ │Client   │ │Transfer  │ │Service   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├──────────────────────────────────────────────────────────┤
│                   平台适配层 (Platform)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Tauri    │ │WebSocket │ │SPICE FFI │ │File System │ │
│  │ (Desktop)│ │(Web)     │ │(Rust)    │ │(Tauri)     │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 1.4 目录结构

```
cloud-terminal/
├── index.html                    # 入口 HTML
├── package.json                  # 依赖管理
├── vite.config.ts                # Vite 构建配置
├── tsconfig.json                 # TypeScript 配置
├── design.md                     # 设计文档 (本文件)
├── api-docs.md                   # API 接口文档
│
├── src/                          # 前端源码
│   ├── main.tsx                  # 应用入口
│   ├── App.tsx                   # 根组件 (路由+布局)
│   │
│   ├── types/                    # TypeScript 类型定义
│   │   ├── index.ts              # 统一导出
│   │   ├── auth.ts               # 认证相关
│   │   ├── desktop.ts            # 云桌面
│   │   ├── connection.ts         # 远程连接
│   │   ├── file-transfer.ts      # 文件传输
│   │   ├── peripheral.ts         # 外设管理
│   │   ├── security.ts           # 安全策略
│   │   └── settings.ts           # 设置
│   │
│   ├── store/                    # Zustand 状态管理
│   │   ├── authStore.ts          # 认证状态
│   │   ├── desktopStore.ts       # 桌面管理状态
│   │   ├── connectionStore.ts    # 连接状态
│   │   └── settingsStore.ts      # 设置状态
│   │
│   ├── services/                 # 服务层
│   │   ├── api/                  # REST API
│   │   │   ├── client.ts         # Axios 客户端
│   │   │   ├── auth.ts           # 认证 API
│   │   │   ├── desktop.ts        # 桌面管理 API
│   │   │   └── file.ts           # 文件传输 API
│   │   ├── spice/                # SPICE 协议
│   │   │   └── client.ts         # SPICE 客户端
│   │   ├── file-transfer/        # 文件传输
│   │   │   └── index.ts          # 传输服务
│   │   └── security/             # 安全服务
│   │       └── watermark.ts      # 水印服务
│   │
│   ├── components/               # UI 组件
│   │   ├── common/               # 通用组件
│   │   │   ├── Toast.tsx         # 消息提示
│   │   │   ├── Modal.tsx         # 模态框
│   │   │   ├── Watermark.tsx     # 水印组件
│   │   │   └── StatusIndicator.tsx # 状态指示器
│   │   ├── auth/                 # 认证模块
│   │   │   ├── LoginPage.tsx     # 登录页
│   │   │   └── MFAVerification.tsx # MFA 验证
│   │   ├── desktop/              # 桌面管理
│   │   │   ├── DesktopCard.tsx   # 桌面卡片
│   │   │   ├── DesktopList.tsx   # 桌面列表
│   │   │   └── DesktopDetail.tsx # 桌面详情
│   │   ├── connection/           # 远程连接
│   │   │   └── ConnectionView.tsx # 连接视图
│   │   ├── floating-ball/        # 悬浮球
│   │   │   └── FloatingBall.tsx  # 悬浮球组件
│   │   ├── settings/             # 设置模块
│   │   │   ├── Settings.tsx      # 设置主页
│   │   │   ├── ConnectionSettings.tsx # 接入设置
│   │   │   ├── DisplaySettings.tsx    # 屏幕设置
│   │   │   ├── PowerSettings.tsx      # 电源设置
│   │   │   ├── PeripheralSettings.tsx # 外设设置
│   │   │   ├── NetworkSettings.tsx    # 网络设置
│   │   │   ├── AccountSettings.tsx    # 账户设置
│   │   │   ├── FirmwareUpdate.tsx     # 固件升级
│   │   │   ├── DeviceTimeSync.tsx     # 设备校时
│   │   │   ├── DiagnosticTools.tsx    # 诊断工具
│   │   │   └── About.tsx             # 关于终端
│   │   └── security/             # 安全模块
│   │       ├── SecurityDashboard.tsx # 安全中心
│   │       └── ClipboardMonitor.tsx  # 剪贴板监控
│   │
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useSPICEConnection.ts # SPICE 连接 Hook
│   │   ├── useFileTransfer.ts    # 文件传输 Hook
│   │   ├── useWatermark.ts       # 水印 Hook
│   │   └── useKeyboard.ts        # 键盘 Hook
│   │
│   └── utils/                    # 工具函数
│       ├── platform.ts           # 平台检测
│       └── logger.ts             # 日志服务
│
└── src-tauri/                    # Tauri 桌面端
    ├── Cargo.toml                # Rust 依赖
    ├── tauri.conf.json           # Tauri 配置
    ├── build.rs                  # 构建脚本
    └── src/
        └── main.rs               # Rust 入口 + SPICE FFI
```

---

## 2. 核心模块设计

### 2.1 用户认证模块

**功能点：**
- 用户名/密码登录
- SSO/OAuth 单点登录
- MFA 多因素认证 (TOTP/短信/邮箱)
- 组织 ID 管理
- Token 自动刷新
- 会话管理

**数据流：**
```
LoginForm → authStore.login() → API /auth/login
    ↓
  [MFA Required?]
    ├── Yes → MFAForm → API /auth/mfa/verify → Token
    └── No  → Token

Token → localStorage → Axios Interceptor → 自动附加到请求
```

### 2.2 云桌面管理模块

**功能点：**
- 桌面列表/网格视图
- 状态过滤 (全部/运行中/已关机/已休眠)
- 电源管理 (开机/关机/重启/休眠)
- 配置信息查看 (CPU/内存/磁盘)
- 计费信息查看
- 还原点管理
- 密码重置

### 2.3 远程连接模块

**功能点：**
- SPICE 协议桌面连接
- 连接状态管理
- 画质设置 (流畅/均衡/高清/无损)
- 分辨率自适应
- 全屏/窗口切换
- 连接指标监控 (FPS/延迟/带宽)

**SPICE 集成架构：**

```
┌────────────────────┐
│   ConnectionView   │  ← React 组件
├────────────────────┤
│   connectionStore  │  ← Zustand 状态
├────────────────────┤
│   SPICEClient      │  ← 服务层封装
├─────────┬──────────┤
│         │          │
│  Tauri  │  Web     │
│  FFI    │  WS      │
│  ↓      │  ↓       │
│ spice-  │ spice-   │
│ client  │ html5    │
│ gtk/c   │          │
└─────────┴──────────┘
```

### 2.4 悬浮球模块 (云电脑助理)

**功能点：**
- 始终置顶的悬浮操作入口
- AI 助手 (知识问答/翻译/写作/绘图/编码)
- 外设管理快捷面板
- 文件传输入口
- 剪贴板管理
- 远程协助
- 共享协同
- 投屏
- 状态监控 (CPU/延迟/帧率)

### 2.5 文件传输模块

**功能点：**
- 上传/下载
- 拖拽上传
- 传输队列管理
- 全速模式
- 进度显示/速度计算
- 暂停/恢复/取消
- 传输历史

### 2.6 外设管理模块

**功能点：**
- USB 设备重定向
- 打印机映射与驱动管理
- 摄像头/麦克风重定向
- 智能卡/UKey 支持
- 外设管控策略

### 2.7 安全模块

**功能点：**
- 明暗水印 (动态水印含用户信息+时间戳)
- 剪贴板管控 (方向/类型/大小限制)
- 录屏审计
- 数据加密 (HTTPS + TLS)
- 可信设备认证
- 安全策略管理

### 2.8 设置模块

**功能点：**
- 接入设置 (服务器IP/端口/超时)
- 屏幕设置 (分辨率/画质/DPI/多屏)
- 电源设置 (自动休眠/关机/联动)
- 外设设置 (USB/打印机/音频)
- 网络设置 (代理/限速)
- 账户设置 (语言/主题/自动登录)
- 固件升级 (在线/本地)
- 设备校时 (NTP)
- 诊断工具
- 关于终端

---

## 3. 数据流架构

### 3.1 状态管理

```
Zustand Store ← → React Components
     │
     ├── authStore      ── 用户认证状态
     ├── desktopStore   ── 桌面列表/详情
     ├── connectionStore ── 连接状态/指标
     └── settingsStore  ── 应用设置
```

### 3.2 API 通信

```
Component → Store Action → API Service → Axios → REST API
                              ↓
                          localStorage (Token)
                              ↓
                          Axios Interceptor (Auth Header)
```

### 3.3 SPICE 通信

```
ConnectionView → connectionStore.connect()
                    ↓
              SPICEClient.connect(config)
                    ↓
              ┌───────┴──────┐
              │              │
          Tauri FFI       WebSocket
              │              │
              ↓              ↓
        spice-client     spice-html5
        (Native)         (Browser)
              │              │
              └───────┬──────┘
                      ↓
              metrics/events callback
                      ↓
              connectionStore.updateMetrics()
```

---

## 4. 路由设计

| 路径 | 组件 | 权限 | 说明 |
|------|------|------|------|
| `/login` | LoginPage | 公开 | 登录页 |
| `/` | DesktopList | 需认证 | 桌面列表首页 |
| `/desktop/:id` | ConnectionView | 需认证 | 远程桌面连接 |
| `/desktop/:id/settings` | DesktopDetail | 需认证 | 桌面详情/设置 |
| `/settings` | Settings | 需认证 | 应用设置页 |
| `/security` | SecurityDashboard | 需认证 | 安全中心 |

---

## 5. 安全设计

### 5.1 传输安全
- HTTPS + TLS 加密通信
- SPICE 连接支持 TLS
- Token 自动刷新机制

### 5.2 数据安全
- 云端存储本地不落地
- 剪贴板内容审计
- 文件传输加密

### 5.3 防截屏追溯
- 动态明水印 (含用户信息+时间戳)
- 暗水印 (隐式嵌入图像数据)
- 录屏审计

### 5.4 访问控制
- 可信设备认证
- 外设管控策略
- 会话超时管理

---

## 6. 平台适配

| 功能 | Linux | Windows | Web |
|------|-------|---------|-----|
| SPICE 客户端 | spice-client-gtk | spicec (spice-client) | spice-html5/WS |
| 桌面框架 | Tauri | Tauri | 浏览器 |
| 文件访问 | Tauri FS | Tauri FS | 浏览器 API |
| 外设重定向 | SPICE USB | SPICE USB | 有限支持 |
| 通知 | 系统通知 | 系统通知 | Web Notification |
| 剪贴板 | 系统剪贴板 | 系统剪贴板 | navigator.clipboard |

---

## 7. 部署与构建

### 7.1 开发环境

```bash
# 初始化
npm install

# 启动开发服务器 (Web)
npm run dev

# 启动 Tauri 开发 (Desktop)
npm run tauri dev
```

### 7.2 构建

```bash
# Web 构建
npm run build

# Tauri 桌面构建
npm run tauri build
```

### 7.3 环境要求

- Node.js >= 18
- Rust >= 1.70 (Tauri 构建)
- Linux: spice-client-gtk 开发包
- Windows: SPICE Windows 客户端

---

## 8. 非功能性需求

| 指标 | 目标 |
|------|------|
| 启动时间 | < 3s |
| 内存占用 | < 200MB |
| SPICE 连接时间 | < 2s |
| 帧率 | 30-60 FPS |
| 延迟 | < 50ms (局域网) |
| 文件传输速度 | 支持线速 |
| 可同时管理桌面数 | >= 50 |

---

*文档版本: 1.0.0 | 更新日期: 2025-07-01*
