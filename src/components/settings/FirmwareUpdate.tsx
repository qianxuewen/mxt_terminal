import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';

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
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>固件升级</h2>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 48 }}>📦</span>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>云终端客户端</div>
            <div style={{ color: '#888', fontSize: 13 }}>当前版本: v{fw.currentVersion}</div>
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
          <InfoItem label="更新状态" value={fw.updateAvailable ? '有可用更新' : '已是最新'} color={fw.updateAvailable ? '#52c41a' : '#888'} />
        </div>

        {fw.changelog && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>更新日志</div>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, color: '#ccc', fontSize: 13, whiteSpace: 'pre-line' }}>
              {fw.changelog}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {updating && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 4 }}>
              <span>升级中...</span>
              <span>{Math.round(updateProgress)}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${updateProgress}%`, background: 'linear-gradient(90deg, #4a6cf7, #6a3de8)', borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleCheckUpdate}
            disabled={loading}
            style={{
              padding: '10px 24px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ccc',
              fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '检查中...' : '检查更新'}
          </button>

          {fw.updateAvailable && (
            <button
              onClick={handleUpdate}
              disabled={updating}
              style={{
                padding: '10px 32px', background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
                border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: updating ? 'not-allowed' : 'pointer',
              }}
            >
              {updating ? '升级中...' : '立即升级'}
            </button>
          )}

          {/* 本地升级 */}
          <button
            style={{
              padding: '10px 24px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ccc',
              fontSize: 14, cursor: 'pointer',
            }}
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
    <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, color: color || '#ccc', fontWeight: 500 }}>{value}</div>
  </div>
);

export default FirmwareUpdate;
