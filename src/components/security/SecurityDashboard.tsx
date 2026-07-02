import React, { useState } from 'react';
import type { SecurityPolicy, WatermarkConfig, ClipboardPolicy, AuditRecord } from '@/types';

const mockPolicy: SecurityPolicy = {
  id: 'sp-001',
  name: '默认安全策略',
  description: '系统默认安全策略配置',
  watermark: {
    enabled: true,
    type: 'text',
    content: '云终端 - 机密文件',
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
    padding: '8px 16px', background: activeTab === tab ? 'rgba(74,108,247,0.2)' : 'transparent',
    border: 'none', borderRadius: 6, color: activeTab === tab ? '#4a6cf7' : '#999',
    fontSize: 13, cursor: 'pointer',
  });

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, marginTop: 16,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14,
  };

  const renderPolicy = () => (
    <div>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#fff' }}>{mockPolicy.name}</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>{mockPolicy.description}</p>

        <div style={rowStyle}><span style={{ color: '#888' }}>USB 重定向</span><span style={{ color: mockPolicy.usbRedirect ? '#52c41a' : '#ff4d4f' }}>{mockPolicy.usbRedirect ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>USB 只读模式</span><span style={{ color: mockPolicy.usbReadOnly ? '#52c41a' : '#888' }}>{mockPolicy.usbReadOnly ? '是' : '否'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>打印机映射</span><span style={{ color: mockPolicy.printerMapping ? '#52c41a' : '#ff4d4f' }}>{mockPolicy.printerMapping ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>磁盘映射</span><span style={{ color: mockPolicy.diskMapping ? '#52c41a' : '#ff4d4f' }}>{mockPolicy.diskMapping ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>磁盘映射只读</span><span style={{ color: mockPolicy.diskMappingReadOnly ? '#52c41a' : '#888' }}>{mockPolicy.diskMappingReadOnly ? '是' : '否'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>录屏审计</span><span style={{ color: mockPolicy.screenRecording ? '#52c41a' : '#ff4d4f' }}>{mockPolicy.screenRecording ? '启用' : '禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>录屏保留天数</span><span style={{ color: '#ccc' }}>{mockPolicy.screenRecordingRetentionDays} 天</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>最大登录尝试</span><span style={{ color: '#ccc' }}>{mockPolicy.maxLoginAttempts} 次</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>会话超时</span><span style={{ color: '#ccc' }}>{mockPolicy.sessionTimeout} 分钟</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>可信设备认证</span><span style={{ color: mockPolicy.trustedDeviceOnly ? '#faad14' : '#888' }}>{mockPolicy.trustedDeviceOnly ? '启用' : '仅限可信设备'}</span></div>
      </div>
    </div>
  );

  const renderWatermark = () => {
    const wm = mockPolicy.watermark as WatermarkConfig & { text?: string; fontSize?: number };
    return (
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#fff' }}>水印配置</h3>
        <div style={rowStyle}><span style={{ color: '#888' }}>水印状态</span><span style={{ color: wm.enabled ? '#52c41a' : '#ff4d4f' }}>{wm.enabled ? '已启用' : '已禁用'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>水印内容</span><span style={{ color: '#ccc' }}>{wm.content}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>水印样式</span><span style={{ color: '#ccc' }}>{wm.style === 'dark' ? '暗水印' : '明水印'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>透明度</span><span style={{ color: '#ccc' }}>{Math.round((wm.opacity || 0) * 100)}%</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>字体大小</span><span style={{ color: '#ccc' }}>{wm.fontSize || 14}px</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>旋转角度</span><span style={{ color: '#ccc' }}>{wm.rotation || -30}°</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>动态水印</span><span style={{ color: wm.dynamic ? '#52c41a' : '#888' }}>{wm.dynamic ? '开启（含用户信息+时间戳）' : '关闭'}</span></div>
      </div>
    );
  };

  const renderClipboard = () => {
    const cb = mockPolicy.clipboard;
    return (
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#fff' }}>剪贴板管控</h3>
        <div style={rowStyle}><span style={{ color: '#888' }}>传输方向</span><span style={{ color: '#ccc' }}>
          {cb.direction === 'both' ? '双向允许' : cb.direction === 'localToRemote' ? '仅本地→远程' : cb.direction === 'remoteToLocal' ? '仅远程→本地' : '禁止'}
        </span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>允许类型</span><span style={{ color: '#ccc' }}>{cb.allowedTypes.join(', ')}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>大小限制</span><span style={{ color: '#ccc' }}>{cb.maxSize > 0 ? `${(cb.maxSize / 1024 / 1024).toFixed(1)} MB` : '无限制'}</span></div>
        <div style={rowStyle}><span style={{ color: '#888' }}>审计日志</span><span style={{ color: cb.auditEnabled ? '#52c41a' : '#888' }}>{cb.auditEnabled ? '启用' : '禁用'}</span></div>
      </div>
    );
  };

  const renderAudit = () => (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#ccc', fontSize: 13 }}>
          <option>全部事件</option>
          <option>登录日志</option>
          <option>剪贴板操作</option>
          <option>文件传输</option>
          <option>外设操作</option>
        </select>
        <input type="text" placeholder="搜索..." style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 13, flex: 1 }} />
      </div>

      {mockAuditLogs.map((log) => (
        <div key={log.id} style={{ padding: '12px 16px', marginBottom: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: `3px solid ${log.severity === 'critical' ? '#ff4d4f' : log.severity === 'warning' ? '#faad14' : '#4a6cf7'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{log.eventType}</span>
            <span style={{ color: '#888', fontSize: 12 }}>{new Date(log.timestamp).toLocaleString('zh-CN')}</span>
          </div>
          <div style={{ color: '#888', fontSize: 12 }}>
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
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>安全中心</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>安全管理与策略配置</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a', display: 'inline-block' }} />
          <span style={{ color: '#888', fontSize: 13 }}>安全策略运行中</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
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
