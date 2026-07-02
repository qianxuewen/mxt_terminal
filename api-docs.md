# 云终端 API 接口文档

## Cloud Terminal API Documentation

> 基础路径: `https://api.cloud-terminal.local/v1`
> 内容类型: `application/json`

---

## 目录

1. [认证 API](#1-认证-api)
2. [云桌面 API](#2-云桌面-api)
3. [文件传输 API](#3-文件传输-api)
4. [状态码说明](#9-状态码说明)

---

## 1. 认证 API

### 1.1 用户登录

```
POST /auth/login
```

登录云终端系统，获取访问令牌。

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| organizationId | string | 否 | 组织 ID |
| rememberMe | boolean | 否 | 记住登录状态 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": "u-001",
      "username": "admin",
      "displayName": "管理员",
      "email": "admin@example.com",
      "phone": "13800138000",
      "role": "admin",
      "organizationId": "org-001",
      "organizationName": "默认组织",
      "permissions": ["desktop:*", "settings:*", "admin:*"]
    }
  },
  "requestId": "req-abc123"
}
```

### 1.2 MFA 验证

```
POST /auth/mfa/verify
```

二次验证接口。

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 登录返回的会话 ID |
| method | string | 是 | 验证方式: totp / sms / email |
| code | string | 是 | 验证码 |

### 1.3 获取 MFA 配置

```
GET /auth/mfa/setup?sessionId={sessionId}
```

### 1.4 刷新 Token

```
POST /auth/refresh
```

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 |

### 1.5 登出

```
POST /auth/logout
```

### 1.6 获取当前用户信息

```
GET /auth/me
```

### 1.7 更新用户信息

```
PUT /auth/profile
```

### 1.8 获取组织列表

```
GET /auth/organizations
```

### 1.9 SSO 登录

```
POST /auth/sso/{provider}/callback
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| provider | path | 是 | 提供商: saml / oidc / cas |
| code | string | 是 | SSO 授权码 |

---

## 2. 云桌面 API

### 2.1 获取桌面列表

```
GET /desktops
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 12 |
| status | string | 否 | 状态过滤: running/stopped/suspended |
| search | string | 否 | 搜索关键词 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "d-001",
        "name": "办公云桌面-Windows",
        "description": "日常办公使用",
        "status": "running",
        "osType": "windows",
        "osName": "Windows Server 2022",
        "cpu": 8,
        "memory": 32,
        "diskSize": 256,
        "ipAddress": "192.168.201.131",
        "spicePort": 5900,
        "createdAt": "2025-01-15T08:00:00Z",
        "expiredAt": "2026-12-31T23:59:59Z",
        "region": "华东1",
        "tags": {
          "department": "研发部",
          "env": "production"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 12
  },
  "requestId": "req-def456"
}
```

### 2.2 获取桌面详情

```
GET /desktops/{id}
```

### 2.3 电源操作

```
POST /desktops/{id}/power
```

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 操作: start / stop / restart / suspend / resume |

### 2.4 获取电源状态

```
GET /desktops/{id}/power
```

### 2.5 获取配置信息

```
GET /desktops/{id}/config
```

### 2.6 获取计费信息

```
GET /desktops/{id}/billing
```

### 2.7 重置密码

```
POST /desktops/{id}/password
```

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| password | string | 是 | 新密码（至少6位） |

### 2.8 创建还原点

```
POST /desktops/{id}/restore-points
```

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 还原点名称 |
| description | string | 否 | 描述 |

### 2.9 获取还原点列表

```
GET /desktops/{id}/restore-points
```

### 2.10 从还原点恢复

```
POST /desktops/{id}/restore
```

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pointId | string | 是 | 还原点 ID |

---

## 3. 文件传输 API

### 3.1 列举目录文件

```
GET /transfer/{desktopId}/files?path={path}
```

### 3.2 获取磁盘列表

```
GET /transfer/{desktopId}/disks
```

### 3.3 创建目录

```
POST /transfer/{desktopId}/directory
```

### 3.4 上传文件

```
POST /transfer/{desktopId}/upload
```

**请求格式:** `multipart/form-data`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 上传文件 |
| remotePath | string | 是 | 远程目标路径 |

### 3.5 下载文件

```
GET /transfer/{desktopId}/download?path={remotePath}
```

### 3.6 获取传输历史

```
GET /transfer/{desktopId}/history
```

### 3.7 取消传输

```
POST /transfer/{taskId}/cancel
```

### 3.8 暂停/恢复传输

```
POST /transfer/{taskId}/toggle
```

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| paused | boolean | 是 | true=暂停, false=恢复 |

---

## 9. 状态码说明

### 业务状态码

| code | 说明 |
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

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token 过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求频率过高 |
| 500 | 服务器内部错误 |
| 502 | 网关错误 |
| 503 | 服务暂时不可用 |

---

## 附录

### 鉴权方式

```
Authorization: Bearer {accessToken}
```

所有需要认证的请求必须在 HTTP 头中携带有效的 Bearer Token。

### 公共请求头

| 头 | 值 | 必填 |
|------|------|------|
| Content-Type | application/json | 是 |
| Authorization | Bearer {token} | 是 (需认证接口) |
| X-Request-Id | uuid | 否 (用于追踪) |
| X-Client-Version | string | 否 (客户端版本) |

### 公共响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "requestId": "req-xxx"
}
```

---

*文档版本: 1.0.0 | 更新日期: 2025-07-01*
