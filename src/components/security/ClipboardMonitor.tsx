import React, { useState, useEffect } from 'react';
import type { ClipboardItem, ClipboardPolicy } from '@/types';
import { theme, inputStyle, labelStyle, sectionTitleStyle, cardStyle } from '@/theme';

const mockClipboardHistory: ClipboardItem[] = [
  { id: 'cb-1', content: 'Hello, World! This is a test clipboard content.', type: 'plaintext', size: 42, source: 'local', timestamp: new Date().toISOString(), direction: 'localToRemote', blocked: false },
  { id: 'cb-2', content: '机密文件内容摘要...', type: 'richtext', size: 1024, source: 'remote', timestamp: new Date(Date.now() - 120000).toISOString(), direction: 'remoteToLocal', blocked: false },
  { id: 'cb-3', content: '截图_2025_07_01.png', type: 'image', size: 204800, source: 'local', timestamp: new Date(Date.now() - 300000).toISOString(), direction: 'localToRemote', blocked: true },
];

const ClipboardMonitor: React.FC = () => {
  const [history] = useState<ClipboardItem[]>(mockClipboardHistory);
  const [policy, setPolicy] = useState<ClipboardPolicy>({
    direction: 'both',
    allowedTypes: ['plaintext', 'richtext'],
    maxSize: 10485760,
    auditEnabled: true,
  });

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>剪贴板管控</h2>

      {/* Policy Controls */}
      <div style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
        <h3 style={sectionTitleStyle}>管控策略</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>传输方向</label>
            <select value={policy.direction} onChange={(e) => setPolicy({ ...policy, direction: e.target.value as any })}
              style={inputStyle}>
              <option value="both">双向允许</option>
              <option value="localToRemote">仅本地→远程</option>
              <option value="remoteToLocal">仅远程→本地</option>
              <option value="disabled">禁止</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>限制大小</label>
            <input type="number" value={policy.maxSize / 1024 / 1024}
              onChange={(e) => setPolicy({ ...policy, maxSize: parseFloat(e.target.value) * 1024 * 1024 })}
              style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Clipboard History */}
      <div style={{ ...cardStyle, padding: 20 }}>
        <h3 style={sectionTitleStyle}>剪贴板历史</h3>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: theme.textTertiary, fontSize: 13 }}>暂无剪贴板记录</div>
        ) : (
          history.map((item) => (
            <div key={item.id} style={{
              padding: '12px 16px', marginBottom: 8, borderRadius: 8,
              background: item.blocked ? 'rgba(255,77,79,0.04)' : theme.bgPage,
              border: `1px solid ${item.blocked ? 'rgba(255,77,79,0.1)' : theme.border}`,
              borderLeft: `3px solid ${item.blocked ? '#ff4d4f' : theme.primary}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: theme.textPrimary, fontSize: 13 }}>
                  {item.source === 'local' ? '本地' : '远程'} → {item.direction.includes('localToRemote') ? '远程' : '本地'}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: theme.textTertiary, fontSize: 11 }}>{item.type}</span>
                  <span style={{ color: theme.textTertiary, fontSize: 11 }}>{item.size > 1024 ? `${(item.size / 1024).toFixed(1)}KB` : `${item.size}B`}</span>
                  {item.blocked && <span style={{ color: '#ff4d4f', fontSize: 11, fontWeight: 600 }}>已拦截</span>}
                </div>
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content}</div>
              <div style={{ color: theme.textTertiary, fontSize: 11, marginTop: 2 }}>{new Date(item.timestamp).toLocaleString('zh-CN')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClipboardMonitor;
