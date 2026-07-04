import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, secondaryBtnStyle, sectionTitleStyle, cardStyle } from '@/theme';

const FirmwareUpdate: React.FC = () => {
  const { settings, checkFirmwareUpdate, performFirmwareUpdate, loading } = useSettingsStore();
  const fw = settings.firmware;
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  const handleCheckUpdate = async () => {
    await checkFirmwareUpdate();
    toast.success('检查完成');
  };

  const handleUpdate = async () => {
    if (!fw.updateAvailable) {
      toast.info('已是最新版本');
      return;
    }
    setUpdating(true);
    setUpdateProgress(0);

    // Simulate update progress
    const interval = setInterval(() => {
      setUpdateProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 10;
      });
    }, 1000);

    try {
      await performFirmwareUpdate();
      clearInterval(interval);
      setUpdateProgress(100);
      toast.success('固件升级完成');
    } catch {
      clearInterval(interval);
      toast.error('升级失败');
    }
    setUpdating(false);
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <InfoItem label="最新版本" value={fw.latestVersion ? `v${fw.latestVersion}` : '-'} />
          <InfoItem label="发布日期" value={fw.releaseDate ? new Date(fw.releaseDate).toLocaleDateString('zh-CN') : '-'} />
          <InfoItem label="更新大小" value={fw.updateSize ? `${fw.updateSize} MB` : '-'} />
          <InfoItem label="更新类型" value={
            fw.updateType === 'critical' ? '安全更新' :
            fw.updateType === 'recommended' ? '推荐更新' : '可选更新'
          } />
          <InfoItem label="上次检查" value={fw.lastCheckTime ? new Date(fw.lastCheckTime).toLocaleString('zh-CN') : '未检查'} />
          <InfoItem label="更新状态" value={fw.updateAvailable ? '有可用更新' : '已是最新'} color={theme.success} />
        </div>

        {fw.changelog && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, marginBottom: 8 }}>更新日志</div>
            <div style={{ background: theme.bgInput, borderRadius: 8, padding: 12, color: theme.textSecondary, fontSize: 13, whiteSpace: 'pre-line' }}>
              {fw.changelog}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {updating && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.textTertiary, marginBottom: 4 }}>
              <span>升级中...</span>
              <span>{Math.round(updateProgress)}%</span>
            </div>
            <div style={{ height: 6, background: theme.borderLight, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${updateProgress}%`, background: theme.gradientPrimary, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleCheckUpdate}
            disabled={loading}
            style={secondaryBtnStyle}
          >
            {loading ? '检查中...' : '检查更新'}
          </button>

          {fw.updateAvailable && (
            <button
              onClick={handleUpdate}
              disabled={updating}
              style={{
                padding: '10px 32px',
                background: theme.gradientPrimary,
                border: 'none', borderRadius: theme.radius, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: updating ? 'not-allowed' : 'pointer',
              }}
            >
              {updating ? '升级中...' : '立即升级'}
            </button>
          )}

          {/* 本地升级 */}
          <button
            style={secondaryBtnStyle}
            onClick={() => toast.info('请选择固件文件')}
          >
            本地升级
          </button>
        </div>
      </div>
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
