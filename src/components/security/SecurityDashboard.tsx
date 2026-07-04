import React, { useState } from 'react';
import type { SecurityPolicy, WatermarkConfig, ClipboardPolicy, AuditRecord } from '@/types';
import { theme, cardStyle } from '@/theme';

const mockPolicy: SecurityPolicy = {
  id: 'sp-001',
  name: '默认安全策略',
  description: '系统默认安全策略配置',
  watermark: {
    enabled: true,
    type: 'text',
    content: 'TP-LINK 云终端 - 机密文件',
    style: 'dark',
    opacity: 0.08,
    fontSize: 14,
    fontColor: '#ffffff',
    rotation: -30,
    density: 20,
    dynamic: true,
    userName: '管理员',
    timestamp: new Date().toISOString(),
  },
  clipboard: {
    direction: 'both',
    allowedTypes: ['plaintext', 'richtext', 'image'],
    maxSize: 10485760,
    auditEnabled: true,
  },
  usbRedirect: true,
  usbReadOnly: false,
  printerMapping: true,
  diskMapping: true,
  diskMappingReadOnly: true,
  screenRecording: true,
  screenRecordingRetentionDays: 90,
  trustedDeviceOnly: false,
  trustedDeviceList: [],
  maxLoginAttempts: 5,
  sessionTimeout: 60,
};

const mockAuditLogs: AuditRecord[] = [
  { id: 'a-001', eventType: 'login', userId: 'u-001', userName: '管理员', desktopId: 'd-001', timestamp: new Date().toISOString(), details: { ip: '192.168.1.100', method: 'password' }, severity: 'info' },
  { id: 'a-002', eventType: 'clipboard', userId: 'u-001', userName: '管理员', desktopId: 'd-001', timestamp: new Date(Date.now() - 60000).toISOString(), details: { direction: 'localToRemote', type: 'text', size: 1024 }, severity: 'info' },
  { id: 'a-003', eventType: 'file_transfer', userId: 'u-001', userName: '管理员', desktopId: 'd-001', timestamp: new Date(Date.now() - 300000).toISOString(), details: { fileName: 'report.docx', size: '2.5MB', direction: 'upload' }, severity: 'info' },
];

const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'policy' | 'watermark' | 'clipboard' | 'audit'>('policy');

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: '8px 16px',
    background: activeTab === tab ? theme.primaryLight : 'transparent',
    border: 'none', borderRadius: 6,
    color: activeTab === tab ? theme.primary : theme.textTertiary,
    fontSize: 13, cursor: 'pointer',
    fontWeight: activeTab === tab ? 500 : 400,
  });

  const sectionStyle: React.CSSProperties = {
    ...cardStyle,
    padding: 20,
    marginTop: 16,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
    borderBottom: `1px solid ${theme.borderLight}`, fontSize: 14,
  };

  const renderPolicy = () => (
    <div>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>{mockPolicy.name}</h3>
        <p style={{ color: theme.textTertiary, fontSize: 13, marginBottom: 16 }}>{mockPolicy.description}</p>

        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>USB 重定向</span><span style={{ color: mockPolicy.usbRedirect ? theme.success : '#ff4d4f' }}>{mockPolicy.usbRedirect ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>USB 只读模式</span><span style={{ color: mockPolicy.usbReadOnly ? theme.success : theme.textTertiary }}>{mockPolicy.usbReadOnly ? '是' : '否'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>打印机映射</span><span style={{ color: mockPolicy.printerMapping ? theme.success : '#ff4d4f' }}>{mockPolicy.printerMapping ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>磁盘映射</span><span style={{ color: mockPolicy.diskMapping ? theme.success : '#ff4d4f' }}>{mockPolicy.diskMapping ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>磁盘映射只读</span><span style={{ color: mockPolicy.diskMappingReadOnly ? theme.success : theme.textTertiary }}>{mockPolicy.diskMappingReadOnly ? '是' : '否'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>录屏审计</span><span style={{ color: mockPolicy.screenRecording ? theme.success : '#ff4d4f' }}>{mockPolicy.screenRecording ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>录屏保留天数</span><span style={{ color: theme.textSecondary }}>{mockPolicy.screenRecordingRetentionDays} 天</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>最大登录尝试</span><span style={{ color: theme.textSecondary }}>{mockPolicy.maxLoginAttempts} 次</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>会话超时</span><span style={{ color: theme.textSecondary }}>{mockPolicy.sessionTimeout} 分钟</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>可信设备认证</span><span style={{ color: mockPolicy.trustedDeviceOnly ? '#F5A623' : theme.textTertiary }}>{mockPolicy.trustedDeviceOnly ? '启用' : '仅限可信设备'}</span></div>
      </div>
    </div>
  );

  const renderWatermark = () => {
    const wm = mockPolicy.watermark as WatermarkConfig & { text?: string; fontSize?: number };
    return (
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>水印配置</h3>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>水印状态</span><span style={{ color: wm.enabled ? theme.success : '#ff4d4f' }}>{wm.enabled ? '已启用' : '已禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>水印内容</span><span style={{ color: theme.textSecondary }}>{wm.content}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>水印样式</span><span style={{ color: theme.textSecondary }}>{wm.style === 'dark' ? '暗水印' : '明水印'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>透明度</span><span style={{ color: theme.textSecondary }}>{Math.round((wm.opacity || 0) * 100)}%</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>字体大小</span><span style={{ color: theme.textSecondary }}>{wm.fontSize || 14}px</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>旋转角度</span><span style={{ color: theme.textSecondary }}>{wm.rotation || -30}°</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>动态水印</span><span style={{ color: wm.dynamic ? theme.success : theme.textTertiary }}>{wm.dynamic ? '开启（含用户信息+时间戳）' : '关闭'}</span></div>
      </div>
    );
  };

  const renderClipboard = () => {
    const cb = mockPolicy.clipboard;
    return (
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>剪贴板管控</h3>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>传输方向</span><span style={{ color: theme.textSecondary }}>
          {cb.direction === 'both' ? '双向允许' : cb.direction === 'localToRemote' ? '仅本地→远程' : cb.direction === 'remoteToLocal' ? '仅远程→本地' : '禁止'}
        </span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>允许类型</span><span style={{ color: theme.textSecondary }}>{cb.allowedTypes.join(', ')}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>大小限制</span><span style={{ color: theme.textSecondary }}>{cb.maxSize > 0 ? `${(cb.maxSize / 1024 / 1024).toFixed(1)} MB` : '无限制'}</span></div>
        <div style={rowStyle}><span style={{ color: theme.textTertiary }}>审计日志</span><span style={{ color: cb.auditEnabled ? theme.success : theme.textTertiary }}>{cb.auditEnabled ? '启用' : '禁用'}</span></div>
      </div>
    );
  };

  const renderAudit = () => (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select style={{ padding: '8px 12px', background: theme.bgInput, border: `1px solid ${theme.borderInput}`, borderRadius: 6, color: theme.textSecondary, fontSize: 13 }}>
          <option>全部事件</option>
          <option>登录日志</option>
          <option>剪贴板操作</option>
          <option>文件传输</option>
          <option>外设操作</option>
        </select>
        <input type="text" placeholder="搜索..." style={{ padding: '8px 12px', background: theme.bgInput, border: `1px solid ${theme.borderInput}`, borderRadius: 6, color: theme.textPrimary, fontSize: 13, flex: 1 }} />
      </div>

      {mockAuditLogs.map((log) => (
        <div key={log.id} style={{ padding: '12px 16px', marginBottom: 8, background: theme.bgCard, borderRadius: 8, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${log.severity === 'critical' ? '#ff4d4f' : log.severity === 'warning' ? '#F5A623' : theme.primary}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: theme.textPrimary, fontSize: 13, fontWeight: 500 }}>{log.eventType}</span>
            <span style={{ color: theme.textTertiary, fontSize: 12 }}>{new Date(log.timestamp).toLocaleString('zh-CN')}</span>
          </div>
          <div style={{ color: theme.textTertiary, fontSize: 12 }}>
            {log.userName} · {JSON.stringify(log.details)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '24px 32px', height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: theme.textPrimary }}>安全中心</h1>
          <p style={{ margin: '4px 0 0', color: theme.textTertiary, fontSize: 14 }}>安全管理与策略配置</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.success, display: 'inline-block' }} />
          <span style={{ color: theme.textTertiary, fontSize: 13 }}>安全策略运行中</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${theme.border}`, paddingBottom: 8 }}>
        {[
          { key: 'policy', label: '安全策略' },
          { key: 'watermark', label: '水印管理' },
          { key: 'clipboard', label: '剪贴板管控' },
          { key: 'audit', label: '审计日志' },
        ].map(({ key, label }) => (
          <button key={key} style={tabStyle(key)} onClick={() => setActiveTab(key as any)}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'policy' && renderPolicy()}
      {activeTab === 'watermark' && renderWatermark()}
      {activeTab === 'clipboard' && renderClipboard()}
      {activeTab === 'audit' && renderAudit()}
    </div>
  );
};

export default SecurityDashboard;
