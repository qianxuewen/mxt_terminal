import React, { useState, useRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, secondaryBtnStyle, sectionTitleStyle, cardStyle } from '@/theme';

// 模拟 U 盘文件系统（类似文件夹浏览）
const MOCK_USB_ROOT = {
  name: 'SanDisk USB 3.0 (D:)',
  type: 'folder' as const,
  children: [
    { name: 'firmware', type: 'folder' as const, children: [
      { name: 'v2.0', type: 'folder' as const, children: [
        { name: 'tplink_firmware_v2.0.0.bin', type: 'file' as const },
        { name: 'tplink_firmware_v2.0.0.sig', type: 'file' as const },
      ]},
      { name: 'tplink_firmware_v1.9.0.bin', type: 'file' as const },
    ]},
    { name: 'boot', type: 'folder' as const, children: [
      { name: 'bootloader.bin', type: 'file' as const },
      { name: 'uboot.img', type: 'file' as const },
    ]},
    { name: 'readme.txt', type: 'file' as const },
    { name: 'update.img', type: 'file' as const },
  ],
};

type FileEntry = { name: string; type: 'folder'; children: FileEntry[] } | { name: string; type: 'file' };

const FirmwareUpdate: React.FC = () => {
  const { settings, checkFirmwareUpdate, performFirmwareUpdate, loading } = useSettingsStore();
  const fw = settings.firmware;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [updateFound, setUpdateFound] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showUsbPanel, setShowUsbPanel] = useState(false);
  const [currentPath, setCurrentPath] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getCurrentDir = () => {
    let dir: FileEntry[] = [MOCK_USB_ROOT];
    for (const entry of currentPath) {
      if (entry.type === 'folder' && entry.children) {
        const found = dir.find(d => d.name === entry.name);
        if (found && found.type === 'folder') dir = found.children;
      }
    }
    return dir;
  };

  const getPathString = () => {
    const parts = [MOCK_USB_ROOT.name, ...currentPath.map(e => e.name)];
    return parts.join(' > ');
  };

  const openFolder = (entry: FileEntry) => {
    if (entry.type === 'folder') {
      setCurrentPath(prev => [...prev, entry]);
      setSelectedFile(null);
    } else {
      setSelectedFile(entry.name);
    }
  };

  const goBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
      setSelectedFile(null);
    }
  };

  const handleCheckUpdate = async () => {
    setChecked(false);
    setUpdateFound(false);
    await checkFirmwareUpdate();
    setChecked(true);
    const hasUpdate = Math.random() > 0.3;
    setUpdateFound(hasUpdate);
    toast.success(hasUpdate ? '发现新版本 v2.0.0' : '已是最新版本');
  };

  const handleOnlineUpdate = async () => {
    setUpdating(true);
    setUpdateProgress(0);
    const interval = setInterval(() => {
      setUpdateProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 10;
      });
    }, 800);
    try {
      await performFirmwareUpdate();
      clearInterval(interval);
      setUpdateProgress(100);
      toast.success('固件升级完成');
    } catch { clearInterval(interval); toast.error('升级失败'); }
    setUpdating(false);
  };

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`已选择文件: ${file.name}`);
      setUpdating(true); setUpdateProgress(0);
      const interval = setInterval(() => {
        setUpdateProgress((p) => {
          if (p >= 100) { clearInterval(interval); setUpdating(false); return 100; }
          return p + Math.random() * 15;
        });
      }, 800);
    }
  };

  const handleUsbUpdate = () => {
    if (!selectedFile) { toast.warning('请选择升级文件'); return; }
    toast.success(`正在从 U 盘升级: ${selectedFile}`);
    setUpdating(true); setUpdateProgress(0);
    const interval = setInterval(() => {
      setUpdateProgress((p) => {
        if (p >= 100) { clearInterval(interval); setUpdating(false); return 100; }
        return p + Math.random() * 12;
      });
    }, 800);
  };

  const openUsbPanel = () => {
    setCurrentPath([]);
    setSelectedFile(null);
    setShowUsbPanel(true);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>固件升级</h2>

      <div style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 48 }}>📦</span>
          <div>
            <div style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 600 }}>TP-LINK 云终端客户端</div>
            <div style={{ color: theme.textTertiary, fontSize: 13 }}>当前版本: v{fw.currentVersion}</div>
          </div>
        </div>

        {/* 版本信息 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <InfoItem label="最新版本" value={fw.latestVersion ? `v${fw.latestVersion}` : '-'} />
          <InfoItem label="发布日期" value={fw.releaseDate ? new Date(fw.releaseDate).toLocaleDateString('zh-CN') : '-'} />
          <InfoItem label="更新大小" value={fw.updateSize ? `${fw.updateSize} MB` : '-'} />
          <InfoItem label="更新类型" value={fw.updateType === 'critical' ? '安全更新' : fw.updateType === 'recommended' ? '推荐更新' : '可选更新'} />
          <InfoItem label="上次检查" value={fw.lastCheckTime ? new Date(fw.lastCheckTime).toLocaleString('zh-CN') : '未检查'} />
          <InfoItem label="更新状态" value={!checked ? '未检查' : updateFound ? '发现新版本 v2.0.0' : '已是最新'} color={!checked ? undefined : updateFound ? theme.success : theme.success} />
        </div>

        {/* 在线升级 */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${theme.borderLight}` }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: 12 }}>在线升级</h3>
          {!checked ? (
            <button onClick={handleCheckUpdate} disabled={loading} style={{ padding: '10px 28px', background: theme.gradientPrimary, border: 'none', borderRadius: theme.radius, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '检查中...' : '检查更新'}
            </button>
          ) : updateFound ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {!updating && (
                  <button onClick={handleOnlineUpdate} style={{ padding: '8px 24px', background: theme.gradientPrimary, border: 'none', borderRadius: theme.radius, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    立即升级
                  </button>
                )}
              </div>
              <div style={{ background: theme.bgInput, borderRadius: 8, padding: 12, color: theme.textSecondary, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {`更新内容：
• 优化 SPICE 协议传输效率，降低延迟
• 修复 USB 重定向异常断开的问题
• 新增多屏扩展支持
• 改进界面交互体验
• 修复已知 Bug 和安全性更新`}
              </div>
            </div>
          ) : null}
        </div>

        {/* 本地升级 */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: 12 }}>本地升级</h3>
          <input ref={fileInputRef} type="file" accept=".bin,.img,.fw" style={{ display: 'none' }} onChange={handleLocalFile} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => fileInputRef.current?.click()} style={secondaryBtnStyle}>
              选择固件文件
            </button>
            <button onClick={openUsbPanel} style={secondaryBtnStyle}>
              📂 从 U 盘选择
            </button>
          </div>
        </div>

        {/* 进度条 */}
        {updating && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.textTertiary, marginBottom: 4 }}>
              <span>升级中...</span>
              <span>{Math.round(updateProgress)}%</span>
            </div>
            <div style={{ height: 6, background: theme.borderLight, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${updateProgress}%`, background: theme.gradientPrimary, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}
      </div>

      {/* U 盘文件浏览弹窗 */}
      {showUsbPanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowUsbPanel(false)}>
          <div style={{ background: theme.bgCard, borderRadius: 12, padding: 24, minWidth: 500, maxWidth: 560, boxShadow: theme.shadowModal }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>从 U 盘选择升级文件</h3>
              <span onClick={() => setShowUsbPanel(false)} style={{ cursor: 'pointer', color: theme.textTertiary, fontSize: 20 }}>✕</span>
            </div>

            {/* 路径导航 */}
            <div style={{ fontSize: 12, color: theme.textTertiary, marginBottom: 12, padding: '6px 10px', background: theme.bgInput, borderRadius: 6 }}>
              {getPathString()}
            </div>

            {/* 文件列表 */}
            <div style={{ maxHeight: 280, overflow: 'auto', border: `1px solid ${theme.border}`, borderRadius: 8 }}>
              {/* 返回上级 */}
              {currentPath.length > 0 && (
                <div onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${theme.borderLight}`, color: theme.primary, fontSize: 13 }}>
                  📂 ..
                </div>
              )}
              {getCurrentDir().map((entry) => (
                <div key={entry.name}
                  onClick={() => openFolder(entry)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer',
                    borderBottom: `1px solid ${theme.borderLight}`,
                    background: selectedFile === entry.name ? theme.primaryLight : 'transparent',
                    color: entry.type === 'folder' ? theme.primary : selectedFile === entry.name ? theme.primary : theme.textPrimary,
                    fontSize: 13,
                  }}>
                  <span>{entry.type === 'folder' ? '📂' : '📄'}</span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowUsbPanel(false)} style={{ flex: 1, padding: '10px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textSecondary, fontSize: 14, cursor: 'pointer' }}>取消</button>
              <button onClick={() => { setShowUsbPanel(false); handleUsbUpdate(); }}
                style={{ flex: 1, padding: '10px', background: theme.gradientPrimary, border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                开始升级
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div>
    <div style={{ fontSize: 12, color: theme.textTertiary, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, color: color || theme.textSecondary, fontWeight: 500 }}>{value}</div>
  </div>
);

export default FirmwareUpdate;
