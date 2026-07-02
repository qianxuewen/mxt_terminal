/**
 * spice-gtk v0.43 构建 + 集成脚本
 *
 * 这个脚本的目标：
 * 1. 在 Linux 上：检测系统 libspice-client-glib 并生成 Rust FFI 绑定
 * 2. 在 Windows 上：编译 spice-gtk 源码并生成 DLL
 *
 * 当前由于 crates.io 网络限制，Rust 方案受阻。
 * 改用以下策略：
 *
 * ─── 短期方案 ───
 * 使用 remote-viewer.exe (已安装) 通过 Tauri sidecar 启动
 * 等网络恢复后切换为内嵌 spice-gtk
 *
 * ─── 长期方案 ───
 * 1. MSYS2 编译 spice-gtk → libspice-client-glib.dll
 * 2. Rust FFI 绑定 → 直连 SPICE 协议
 * 3. 前端 Canvas 渲染
 */

console.log(`
══════════════════════════════════════════════════════
  spice-gtk 集成方案
══════════════════════════════════════════════════════

  [当前状态]   npm ✓  |  crates.io ✗ (网络限制)
  [可用方案]   remote-viewer.exe sidecar

  要完整编译 spice-gtk v0.43 需要:

  ── Windows ──
  1. 安装 MSYS2: https://www.msys2.org/
  2. 安装 MinGW 工具链:
     pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-meson
     pacman -S mingw-w64-x86_64-gtk3 mingw-w64-x86_64-gstreamer
  3. 编译 spice-gtk:
     meson setup build --prefix=$PWD/dist
     meson compile -C build
     meson install -C build
  4. 结果: dist/bin/libspice-client-glib-2.0-0.dll

  ── Linux ──
  sudo apt install libspice-client-glib-2.0-dev libspice-client-gtk-3.0-dev
  pkg-config --cflags --libs spice-client-glib-2.0

══════════════════════════════════════════════════════
`);

// 检测当前环境
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkSpice() {
  // 检查远程客户端
  const candidates = [
    'C:\\Program Files\\virt-viewer\\bin\\remote-viewer.exe',
    'C:\\Program Files\\VirtViewer v11.0-256\\bin\\remote-viewer.exe',
    '/usr/bin/remote-viewer',
    '/usr/bin/spicy',
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log(`[✓] 找到 SPICE 客户端: ${p}`);
      return p;
    }
  }

  // Linux: 检查 pkg-config
  try {
    const out = execSync('pkg-config --modversion spice-client-glib-2.0 2>&1').toString().trim();
    console.log(`[✓] 系统 libspice-client-glib: ${out}`);
    return 'system';
  } catch {}

  console.log('[!] 未找到 SPICE 客户端');
  return null;
}

const found = checkSpice();

if (process.argv.includes('--build')) {
  console.log('\n开始编译 spice-gtk...');
  // TODO: 调用 meson 构建
}
